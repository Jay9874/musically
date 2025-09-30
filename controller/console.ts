import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';

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
 *
 * @param req A form data with song binary
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
    const { meta } = req.body;
    if (!meta) {
      return res.status(400).send({
        message: 'Please provide song meta.',
      });
    }

    return res.status(200).send({
      message: 'Got the song',
    });
  } catch (err) {
    console.log('err at uploading song: ', err);
    return res.status(500).send({
      message: 'Something went wrong',
    });
  }
};
