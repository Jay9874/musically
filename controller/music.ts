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
      text: 'SELECT * FROM albums JOIN songs ON songs.albumid=albums.id WHERE albums.id=$1',
      values: [id],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0) {
      return res.status(400).send({
        message: 'The album could not be loaded.',
      });
    }
    return res.status(200).send({
      albums: result.rows,
    });

  } catch (err) {
    console.log('err while loading a album: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};
