import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction } from 'express';
import { pool } from '../db';
import { DbUser } from '../types/interfaces/interfaces.user';

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
