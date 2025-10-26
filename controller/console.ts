import { Request, type Response, NextFunction } from 'express';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { pool } from '../db';
import { Meta } from '../types/interfaces/interfaces.song';
import {
  SingerOption,
  SongUploadBody,
} from '../types/interfaces/interfaces.console';
import format from 'pg-format';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    const { body } = req.body;
    if (!body) {
      return res.status(400).send({
        message: 'Please provide body for text info about song and album.',
      });
    }
    // Logged in user id
    const loggedUser = res.locals['userId'];
    // Text data in body
    const textData: SongUploadBody = JSON.parse(body);
    const { albumData, songData, meta } = textData;

    // Getting buffers for song and thumbnail
    const files: { [fieldname: string]: Express.Multer.File[] } =
      req.files as any;
    const songFile = files['song'][0];
    const songThumbnailFile: Express.Multer.File = files['songThumbnail'][0];
    const albumThumbnailFile: Express.Multer.File = files['albumThumbnail'][0];

    let albumId;
    /*
      1. Work with Album.
        - If !newAlbum.id then check if any pre existing album with this name.
     */
    if (!albumData.id) {
      // Check if album exists with this name
      const existingAlbum = await pool.query(
        'SELECT id FROM albums WHERE name = $1',
        [albumData.name]
      );
      if (existingAlbum.rowCount !== 0) {
        return res.status(409).send({
          message: 'A album with this name already exists.',
        });
      }
      // Create a new album
      const albumQuery = {
        text: 'INSERT INTO albums(name, userid, description, thumbnail, meta) VALUES($1, $2, $3, $4, $5) RETURNING id',
        values: [
          albumData.name,
          loggedUser,
          albumData.description,
          albumThumbnailFile.buffer,
          meta.albumThumbnailMeta,
        ],
      };

      const createdAlbum = await pool.query(albumQuery);
      if (createdAlbum.rowCount === 0) {
        return res.status(400).send({
          message: 'New album could not be created.',
        });
      } else {
        albumId = createdAlbum.rows[0].id;
      }
    } else {
      // Else update the thumbnail and description of old thumbnail with id
      const updateAlbumQuery = {
        text: 'UPDATE albums SET thumbnail = $1, meta = $2, description = $3 WHERE id = $4 RETURNING id',
        values: [
          albumThumbnailFile.buffer,
          meta.albumThumbnailMeta,
          albumData.description,
          albumData.id,
        ],
      };
      const updatedAlbum = await pool.query(updateAlbumQuery);
      if (updatedAlbum.rowCount === 0) {
        return res.status(400).send({
          message: 'The album could not be updated.',
        });
      } else {
        albumId = updatedAlbum.rows[0].id;
      }
    }

    /*
      2. Work with song
        - Check if song with this title already exists.
        - If no, then insert the new song.
    */
    const existingSong = await pool.query(
      'SELECT id FROM songs WHERE title = $1',
      [songData.title]
    );
    if (existingSong.rowCount !== 0) {
      return res.status(409).send({
        message: 'Song with this title already exits.',
      });
    }

    const songQuery = {
      text: 'INSERT INTO songs(uploaded_by, title, meta, song, thumbnail) VALUES ($1, $2, $3, $4, $5) RETURNING id, title',
      values: [
        loggedUser,
        songData.title,
        meta.songThumbnailMeta,
        songFile.buffer,
        songThumbnailFile.buffer,
      ],
    };

    const songResult = await pool.query(songQuery);
    if (songResult.rowCount === 0) {
      return res.status(400).send({
        message: 'The song could not be uploaded.',
      });
    }
    const addedSong: { id: string; title: string } = songResult.rows[0];

    /*
      3. Add the song in album; song_album mapping
    */
    const addSongToAlbum = await pool.query(
      'INSERT INTO song_album(songid, albumid, song_title) VALUES($1, $2, $3) RETURNING id',
      [addedSong.id, albumId, addedSong.title]
    );
    if (addSongToAlbum.rowCount === 0) {
      return res.status(400).send({
        message: 'Song could not be added in album.',
      });
    }
    /*
      4. Add singer of song to db if new singers
    */
    if (songData.newSingers.length > 0) {
      const addSingersQuery = {
        text: 'INSERT INTO singers(name) VALUES ($1) RETURNING id, name',
        values: [songData.newSingers],
      };
      const addedSingers = await pool.query(addSingersQuery);
      // Create an array of singer ids
      const newSingersIds: SingerOption[] = addedSingers.rows.map((singer) => ({
        id: singer.id,
        name: singer.name,
      }));
      songData.singers = [...songData.singers, ...newSingersIds];
    }

    /*
      5. Add to song_singer mapping
    */
    const dataToInsert = songData.singers.map((obj) => [
      addedSong.title,
      obj.id,
      addedSong.id,
      obj.name,
    ]);

    const addToSingerMappingQuery = format(
      'INSERT INTO song_singer(song_title, singerid, songid, singer_name) VALUES %L RETURNING id',
      dataToInsert
    );

    const addedMaps = await pool.query(addToSingerMappingQuery);
    if (addedMaps.rowCount === 0) {
      return res.status(400).send({
        message: 'Song could not be linked with singers.',
      });
    }

    return res.status(200).send({
      albumId: albumId,
      mappedToAlbum: addSongToAlbum.rows,
      singerMaps: addedMaps.rows,
      song: addedSong,
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

/**
 * @param req Express req object with singer search term in query
 * @param res Matching singer names with term.
 * @param next Error handler is error.
 * @returns Response to client.
 */
export const typeToSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const term = req.query['term'] as string;
    if (!term || term.trim() === '') {
      return res.status(400).send({
        message: 'Cant search for singers, please enter search terms',
      });
    }
    const query = {
      text: 'SELECT name FROM singers WHERE name ILIKE $1',
      values: [term],
    };
    const singers = await pool.query(query);
    return res.status(200).send({
      singers: singers.rows,
    });
  } catch (err) {
    console.log('err while searching for singers with term: ', err);
    return next(err);
  }
};
