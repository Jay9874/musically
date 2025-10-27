import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';

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
    /*
      1. Get the album details from "albums" with album id and user id.
      2. Then get songs in album from "song_album"
    */

    const album = await pool.query('SELECT * FROM albums WHERE id = $1', [id]);

    /*
      Get all the songs joining table song_singer for singers details, songs for meta
    */
    const songsQuery = {
      text: `
    SELECT songs.meta, songs.thumbnail, song_singer.* 
    FROM song_album 
    JOIN songs ON songs.id = song_album.songid
    JOIN song_singer ON song_singer.songid = song_album.songid
    WHERE song_album.albumid = $1
    `,
      values: [id],
    };

    const songsDetails = await pool.query(songsQuery);
    return res.status(200).send({
      album: album.rows[0], // album details with name, thumbnail, and description
      songs: songsDetails.rows, // Songs array with only text not binary with thumbnails, name, singers;
    });
  } catch (err) {
    console.log('err while loading a album: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

/**
 * @param req An id with req query to load song.
 * @param res JSON with song binary and its meta.
 * @param next
 * @returns Response to client.
 */
export const loadSong = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).send({
        message: 'Please provide song id to load.',
      });
    }
    const query = {
      text: 'SELECT song, thumbnail, meta, id, title FROM songs WHERE id=$1',
      values: [id],
    };
    const result = await pool.query(query);
    if (result.rowCount === 0) {
      return res.status(404).send({
        message: 'The song do not exists.',
      });
    }

    return res.status(200).send({
      song: result.rows[0],
    });
  } catch (err) {
    console.log('err while loading a song: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};
