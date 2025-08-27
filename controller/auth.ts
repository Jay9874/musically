import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction, CookieOptions } from 'express';
import { asyncHandler } from '../middleware/async-middleware';
import { ApiError } from '../utils/ApiError';
import { pool } from '../db';
import bcryptjs from 'bcryptjs';
import { DbUser } from '../types/interfaces/interfaces.user';
import transporter from '../configs/nodemailer';
import { SessionManager } from '../utils/sessionManager';
import { Session } from '../types/interfaces/interfaces.session';

const SALT_ROUND: number =
  parseInt(process.env['SALT_ROUND'] as string, 10) || 10; // Fallback to 10 if not set

const sessionManger = new SessionManager();
const EXPIRY_DURATION = Number(process.env['EXPIRY_DURATION']);

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
        message: 'Please, provide your email address.',
      });
    if (!password)
      return res.status(400).send({
        message: 'Please, provide your strong password.',
      });

    // Check if email exists in db
    const emailQuery = {
      text: 'SELECT email, password, verified_email FROM users WHERE email=$1',
      values: [email],
    };
    const emailResult = await pool.query(emailQuery);
    if (emailResult.rowCount === 0)
      return res.status(404).send({
        message:
          'You email does not exists, please check it again or create a new account.',
      });

    const user: DbUser = emailResult.rows[0];
    console.log('the user found is: ', user);
    // Compare the password
    if (!user.verified_email) {
      return res
        .status(401)
        .send({ message: 'Your email is not verified, check your email.' });
    }
    const match = await bcryptjs.compare(password, user.password);
    if (!match)
      return res.status(401).send({
        message:
          'Your credentials did not match, try again or opt for password change',
      });
    // Create a session
    const session: Session | null = await sessionManger.createSession(user.id);
    if (!session) {
      return res.status(401).send('The session could not be created.');
    }
    const sessionCookie: CookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    };
    const longtermCookie: CookieOptions = {
      ...sessionCookie,
      maxAge: EXPIRY_DURATION,
    };
    res.cookie('musically-session', session, sessionCookie);
    res.cookie('musically-longterm', session, longtermCookie);

    return res.status(200).send({
      user: user,
      error: null,
    });
  } catch (err) {
    console.log('an error occurred while signing in: ', err);
    return res.status(500).send({
      data: null,
      message: 'Something went wrong.',
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
        message: 'The email is required, please enter your correct email',
      });
    if (!password)
      return res.status(400).send({
        message: 'Please create a strong password and enter.',
      });

    // First check if any user exists with this email
    const checkExistingUser = `SELECT email FROM users WHERE email = $1`;
    const user = await pool.query(checkExistingUser, [email]);
    if (user.rows.length > 0) {
      return res.status(409).send({
        data: null,
        message: `User already exists with ${user.rows[0].email}, try other email.`,
      });
    }

    /* Any user does not exists with this email
      Hash the password and create a new user
     */

    const hash: string = await bcryptjs.hash(password, SALT_ROUND);
    /*
      Create an random 6 digit otp for email verification
    */
    const otp: string = Math.random().toString(36).slice(-8);

    const query = {
      text: 'INSERT INTO users (email, password, email_otp) VALUES ($1, $2, $3) RETURNING id, email, created_at',
      values: [email, hash, otp],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0)
      return res.status(403).send({
        message: 'Could not create users, try again.',
      });

    await transporter.sendMail({
      from: process.env['GOOGLE_APP_EMAIL'],
      to: result.rows[0].email,
      subject: 'Confirm your email for Musically',
      html: `<h4>Hello there,<h4> <br>
      <p>Thanks for signing up on Musically. Please confirm your email by clicking on the below link.</p>
      `,
    });

    console.log('User added:', result.rows[0]);
    return res.status(200).send({
      message: 'User created, check email to proceed ahead.',
      error: null,
    });
  } catch (err) {
    console.log('error: ', err);
    return res.status(500).json({
      data: null,
      message: 'Could not create user in table.',
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
