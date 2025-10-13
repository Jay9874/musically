import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { LoadedAlbum, SongInAlbum } from '../types/interfaces/interfaces.album';

/**
 *
 * @param req Request do not have body, query or parameter.
 * @param res A json object with albums list.
 * @param next
 * @returns Returns the response sent to client.
 */
export const getAllAlbums = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query('SELECT * FROM albums;');
    return res.status(200).send({
      albums: result.rows,
    });
  } catch (err) {
    console.log('err occurred while getting albums: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

/**
 *
 * @param req A request with parameter id
 * @param res A json with album details
 * @param next
 * @returns A response  to client.
 */

export const albumDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        message: 'Please provide album name to search details.',
      });
    }
    const query = {
      text: 'SELECT * FROM albums WHERE id=$1',
      values: [id],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0) {
      return res.status(404).send({
        message: 'The album could not be found.',
      });
    }

    return res.status(200).send({
      albums: result.rows,
    });
  } catch (err) {
    console.log('err while getting album details: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

/**
 *
 * @param req An id with req parameter to load songs and album.
 * @param res JSON with album details and all the songs in album.
 * @param next
 * @returns Response to client.
 */

export const loadAlbum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        message: 'Please provide album name to search details.',
      });
    }

    const query = {
      text: "SELECT albums.*, songs.thumbnail as songThumbnail, json_build_object('id', songs.id, 'meta', songs.meta) as song, albums.id as albumId FROM albums JOIN songs ON songs.albumid=albums.id WHERE albums.id=$1",
      values: [id],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0) {
      return res.status(400).send({
        message: 'The album could not be loaded.',
      });
    }

    const album = result.rows[0];
    let formattedAlbum: LoadedAlbum = {
      id: album.id,
      name: album.name,
      songs: [],
    };
    result.rows.forEach((album) => {
      formattedAlbum.songs.push({
        ...album.song,
        thumbnail: album.songThumbnail,
      });
    });

    console.log('loaded album is: ', formattedAlbum);
    return res.status(200).send({
      album: formattedAlbum,
    });
  } catch (err) {
    console.log('err while loading a album: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};
