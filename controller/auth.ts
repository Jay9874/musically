import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware/async-middleware';
import { ApiError } from '../utils/ApiError';
import { ApiSuccess } from '../utils/ApiSuccess';
import { User } from '../types/interfaces/interfaces.common';
import { pool } from '../db';

// @desc     Login the user
// @route    /login
// @method   POST

// ? asyncHandler should be used for every request for easy async handling
export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Example user, get from database
    const { email, password } = req.body;

    console.log('email: ', email);
    console.log('password: ', password);

    const user = [{ email: email ?? '' }, { password: password ?? '' }];

    // Return json with success message
    res.status(200).json(new ApiSuccess<User[]>(user, 'Success!'));
  }
);

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    console.log('email: ', email);
    const values = [email, password];

    // First check if any user exists with this email
    const checkExistingUser = `SELECT email FROM users WHERE email = $1`;
    const user = await pool.query(checkExistingUser, [email]);
    if (user.rows.length > 0) {
      return res.status(409).send({
        data: null,
        error: `User already exists with ${user.rows[0].email}, try other email.`,
      });
    }
    const query = `
            INSERT INTO users (email, password)
            VALUES ($1, $2)
            RETURNING id, email, created_at;
          `;
    const result = await pool.query(query, values);
    console.log('User added:', result.rows[0]);
    return res.status(200).send({
      data: 'done',
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
