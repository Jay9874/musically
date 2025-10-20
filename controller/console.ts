import { Request, type Response, NextFunction } from 'express';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { pool } from '../db';
import { Meta } from '../types/interfaces/interfaces.song';

/**
 *
 * @param req Request do not have body, query or parameter.
 * @param res A json object with users list.
 * @param next
 * @returns Returns the response sent to client.
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Logged in user id
    const loggedUser = res.locals['userId'];

    const query = {
      text: 'SELECT id, email, username, roles FROM users WHERE id != $1',
      values: [loggedUser],
    };

    const users = await pool.query(query);
    return res.status(200).send({
      users: users.rows,
    });
  } catch (err) {
    console.log('error occurred while finding all users: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

/**
 *
 * @param req The request contains user id and modified roles array.
 * @param res The response has updated user object.
 * @param next
 * @returns Returns the response to client.
 */

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, roles } = req.body;
    if (!userId || !roles) {
      return res.status(400).send({
        message: 'Please provide correct user details.',
      });
    }

    const query = {
      text: 'UPDATE users SET roles=$1 WHERE id=$2 RETURNING id, username, email, roles',
      values: [roles, userId],
    };

    const updatedUser = await pool.query(query);
    if (updatedUser.rowCount === 0) {
      return res.status(400).send({
        message: 'Could not update the user.',
      });
    }

    return res.status(200).send({
      user: updatedUser.rows[0],
    });
  } catch (err) {
    console.log('error occurred while updating user: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

/**
 * @param req A form data with song binary and meta data
 * @param res A success message with song meta data
 * @param next
 * @returns Response to client.
 */
export const uploadSong = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { metaData } = req.body;
    if (!metaData) {
      return res.status(400).send({
        message: 'Please provide song meta.',
      });
    }

    // Logged in user id
    const loggedUser = res.locals['userId'];

    const meta: Meta = JSON.parse(metaData);
    // if new album then create one
    let albumId: string | null = null;
    if (meta.album!.newAlbum !== '') {
      const albumQuery = {
        text: 'INSERT INTO albums(name, userid) VALUES($1, $2) ON CONFLICT (name, userid) DO UPDATE SET name=EXCLUDED.name RETURNING id',
        values: [meta.album!.newAlbum, loggedUser],
      };

      const createdAlbum = await pool.query(albumQuery);
      if (createdAlbum.rowCount === 0) {
        return res.status(400).send({
          message: 'New album could not be created.',
        });
      }
      albumId = createdAlbum.rows[0].id;
    } else {
      albumId = meta.album!.existingAlbum;
    }

    // Getting buffers for song and thumbnail
    const files: { [fieldname: string]: Express.Multer.File[] } =
      req.files as any;
    const songFile = files['song'][0];
    const thumbnailFile: Express.Multer.File = files['thumbnail'][0];

    // delete the album key from meta
    delete meta.album;

    // Upload the song with thumbnail
    const songQuery = {
      text: 'INSERT INTO songs(albumid, uploaded_by, title, meta, song, thumbnail) VALUES ($1, $2, $3, $4, $5,$6) ON CONFLICT (title, albumid) DO UPDATE SET song = $5 RETURNING *',
      values: [
        albumId,
        loggedUser,
        meta.title,
        meta,
        songFile.buffer,
        thumbnailFile.buffer,
      ],
    };

    const songResult = await pool.query(songQuery);
    if (songResult.rowCount === 0) {
      return res.status(400).send({
        message: 'The song could not be uploaded.',
      });
    }

    return res.status(200).send({
      song: songResult.rows,
    });
  } catch (err) {
    console.log('err at uploading song: ', err);
    return res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

export const relatedData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Logged in user id
    const loggedUser = res.locals['userId'];
    const query = {
      text: 'SELECT * FROM albums WHERE userid=$1',
      values: [loggedUser],
    };

    const result = await pool.query(query);
    return res.status(200).send({
      albums: result.rows,
    });
  } catch (err) {
    console.log('err occurred while getting related data: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

export async function handler(request: Request) {
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname
        /* clientPayload */
      ) => {
        // Generate a client token for the browser to upload the file
        // Make sure to authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
          addRandomSuffix: true,
          // callbackUrl: 'https://example.com/api/avatar/upload',
          // optional, `callbackUrl` is automatically computed when hosted on Vercel
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth, or a value from clientPayload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Called by Vercel API on client upload completion
        // Use tools like ngrok if you want this to work locally

        console.log('blob upload completed', blob, tokenPayload);

        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
