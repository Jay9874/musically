import dotenv from 'dotenv';
dotenv.config();
import { dirname } from 'path';
import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/async-middleware';
import { ApiError } from '../utils/ApiError';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import { DbUser } from '../types/interfaces/interfaces.user';

const SALT_ROUND: number =
  parseInt(process.env['SALT_ROUND'] as string, 10) || 10; // Fallback to 10 if not set

// @desc     Login the user
// @route    /login
// @method   POST

// ? asyncHandler should be used for every request for easy async handling
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Example user, get from database
    const { email, password } = req.body;
    if (!email)
      return res.status(400).send({
        error: 'Please, provide your email address.',
      });
    if (!password)
      return res.status(400).send({
        error: 'Please, provide your strong password.',
      });

    // Check if email exists in db
    const emailQuery = {
      text: 'SELECT email, password FROM users WHERE email=$1',
      values: [email],
    };
    const emailResult = await pool.query(emailQuery);
    if (emailResult.rowCount === 0)
      return res.status(404).send({
        error:
          'You email does not exists, please check it again or create a new account.',
      });

    const user: DbUser = emailResult.rows[0];

    // Compare the password
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).send({
        error:
          'Your credentials did not match, try again or opt for password change',
      });
    return res.status(200).send({
      user: user,
      error: null,
    });
  } catch (err) {
    console.log('an error occurred while signing in: ', err);
    return res.status(500).send({
      data: null,
      error: 'Something went wrong.',
    });
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    console.log('email: ', email);
    /*
      Check the input fields for correctness and validity
    */
    if (!email)
      return res.status(400).send({
        error: 'The email is required, please enter your correct email',
      });
    if (!password)
      return res.status(400).send({
        error: 'Please create a strong password and enter.',
      });

    // First check if any user exists with this email
    const checkExistingUser = `SELECT email FROM users WHERE email = $1`;
    const user = await pool.query(checkExistingUser, [email]);
    if (user.rows.length > 0) {
      return res.status(409).send({
        data: null,
        error: `User already exists with ${user.rows[0].email}, try other email.`,
      });
    }

    /* Any user does not exists with this email
      Hash the password and create a new user
     */

    const hash: string = await bcrypt.hash(password, SALT_ROUND);

    const query = {
      text: 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, created_at',
      values: [email, hash],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0)
      return res.status(403).send({
        error: 'Could not create users, try again.',
      });

    console.log('User added:', result.rows[0]);
    return res.status(200).send({
      user: result.rows[0],
      error: null,
    });
  } catch (err) {
    console.log('error: ', err);
    return res.status(500).json({
      data: null,
      error: 'Could not create user in table.',
    });
  }
};

// ? asyncHandler should be used for every request for easy async handling
export const errorUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Return json with error message and empty data
    throw new ApiError({}, 500, 'Handled by asyncHandler');
  }
);
