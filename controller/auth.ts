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
const COOKIE_EXPIRY_DURATION = Number(process.env['SESSION_EXPIRY_MS']); // in ms
const OTP_EXPIRY = Number(process.env['OTP_EXPIRY_MS']); // in ms

const verifyEmailUrl =
  process.env['NODE_ENV'] === 'development'
    ? 'http://localhost:4200/auth/new-user'
    : '';

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
      text: 'SELECT email, password, verified_email, id FROM users WHERE email=$1',
      values: [email],
    };
    const emailResult = await pool.query(emailQuery);
    if (emailResult.rowCount === 0)
      return res.status(404).send({
        message:
          'You email does not exists, please check it again or create a new account.',
      });

    const user: DbUser = emailResult.rows[0];
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
      return res
        .status(401)
        .send({ message: 'The session could not be created.' });
    }
    const sessionCookie: CookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    };
    const longtermCookie: CookieOptions = {
      ...sessionCookie,
      maxAge: COOKIE_EXPIRY_DURATION,
    };
    res.cookie('musically-session', session.id, sessionCookie);
    res.cookie('musically-longterm', session.id, longtermCookie);

    return res.status(200).send({
      user: {
        email: user.email,
        id: user.id,
      },
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
      // return res.status(409).send({
      //   message: `User already exists with ${user.rows[0].email}, try other email.`,
      // });
      return res.status(409).send({
        message: `You are already registered, please login.`,
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
    const expires_at = new Date();
    expires_at.setTime(expires_at.getTime() + OTP_EXPIRY);

    const query = {
      text: 'INSERT INTO users (email, password, email_otp, otp_expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      values: [email, hash, otp, expires_at],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0)
      return res.status(403).send({
        message: 'Could not create users, try again.',
      });

    const registeredUser: { email: string; token: string } = result.rows[0];
    await transporter.sendMail({
      from: process.env['GOOGLE_APP_EMAIL'],
      to: registeredUser.email,
      subject: 'Confirm your email for Musically',
      html: `<h4>Hello there,<h4> <br>
      <p>Thanks for signing up on Musically. 
      Please confirm your email by clicking on the below link.
      Link will be valid for next <b>${OTP_EXPIRY / 1000} minutes<b>.
      </p>
      <a href='${verifyEmailUrl}?token=${otp}&email=${
        registeredUser.email
      }'>Verify email</a>
      `,
    });

    console.log('User added:', result.rows[0]);
    return res.status(200).send({
      message: 'User created, check email to proceed ahead.',
    });
  } catch (err) {
    console.log('error: ', err);
    return res.status(500).json({
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

// export const validateVerifyToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { token, email } = req.query;
//     if (!token || !email) {
//       return res.status(404).send({
//         message: 'Please give use email and otp to verify your identity.',
//       });
//     }

//     // First find if the token is expired or not
//     const tokenQuery = {
//       text: 'SELECT otp_expires_at FROM users WHERE email=$1 AND email_otp=$2',
//       values: [email, token],
//     };

//     const tokenResult = await pool.query(tokenQuery);

//     if (tokenResult.rowCount === 0) {
//       return res.status(404).send({
//         message: 'The otp could not found, did you create one?',
//       });
//     }
//     const query = {
//       text: 'UPDATE users SET verified_email=$1 WHERE email=$2 AND email_otp=$3 AND otp_expires_at > NOW() RETURNING *',
//       values: [true, email, token],
//     };

//     const result = await pool.query(query);
//     if (result.rowCount === 0) {
//       return res.status(401).send({
//         message: 'The token is either invalid or expired.',
//       });
//     }

//     const user: DbUser = result.rows[0];
//     // Create a session
//     const session: Session | null = await sessionManger.createSession(user.id);
//     if (!session) {
//       return res.status(401).send('The session could not be created.');
//     }

//     const sessionCookie: CookieOptions = {
//       httpOnly: true,
//       secure: process.env['NODE_ENV'] === 'production' ? true : false, // Use secure in production
//       sameSite: 'lax', // Required for cross-origin
//       path: '/', // Ensure cookie is available site-wide
//     };

//     // Set CORS headers
//     res.set('Access-Control-Allow-Credentials', 'true');
//     res.set('Access-Control-Allow-Origin', 'http://localhost:4200'); // Replace with your frontend origin

//     res.cookie('musically-session', `${session.id}`, sessionCookie);
//     // const sessionCookie: CookieOptions = {
//     //   httpOnly: true,
//     //   secure: false,
//     //   sameSite: 'none',
//     //   encode: String,
//     // };
//     // res.cookie('musically-session', `${session.id}`, sessionCookie);

//     return res.status(200).send({
//       user: {
//         email: user.email,
//         id: user.id,
//       },
//       session: session.id,
//     });
//   } catch (err) {
//     console.log('err occurred while validating verification link: ', err);
//     return res.status(500).send({
//       message: 'Something went wrong.',
//     });
//   }
// };

export const validateVerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(404).send({
        message: 'Please provide email and OTP to verify your identity.',
      });
    }

    // Check if token is expired
    const tokenQuery = {
      text: 'SELECT otp_expires_at FROM users WHERE email=$1 AND email_otp=$2',
      values: [email, token],
    };

    const tokenResult = await pool.query(tokenQuery);

    if (tokenResult.rowCount === 0) {
      return res.status(404).send({
        message: 'The OTP could not be found. Did you create one?',
      });
    }

    const query = {
      text: 'UPDATE users SET verified_email=$1 WHERE email=$2 AND email_otp=$3 AND otp_expires_at > NOW() RETURNING *',
      values: [true, email, token],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0) {
      return res.status(401).send({
        message: 'The token is either invalid or expired.',
      });
    }

    const user: DbUser = result.rows[0];
    // Create a session
    const session: Session | null = await sessionManger.createSession(user.id);
    if (!session) {
      return res.status(401).send('The session could not be created.');
    }

    const sessionCookie: CookieOptions = {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production' ? true : false, // Secure in production
      sameSite: 'none',
    };

    res.cookie('musically-session', 'hello', sessionCookie);

    return res.status(200).send({
      user: {
        email: user.email,
        id: user.id,
      },
      session: session.id,
    });
  } catch (err) {
    console.log('Error occurred while validating verification link: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

export const resendVerificationLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).send({
        message: 'Provide an email to resend verification link.',
      });
    }
    /*
      Create an random 6 digit otp for email verification
    */
    const otp: string = Math.random().toString(36).slice(-8);
    const expires_at = new Date();
    expires_at.setTime(expires_at.getTime() + OTP_EXPIRY);

    const query = {
      text: 'UPDATE users SET email_otp=$1, otp_expires_at=$2 WHERE email=$3 RETURNING id, email, email_otp as token',
      values: [otp, expires_at, email],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0)
      return res.status(403).send({
        message: 'Could not resend verification link, try again.',
      });

    const registeredUser: { email: string; token: string } = result.rows[0];
    await transporter.sendMail({
      from: process.env['GOOGLE_APP_EMAIL'],
      to: registeredUser.email,
      subject: 'Confirm your email for Musically',
      html: `<h4>Hello there,<h4>
        <p>No need to worry if your verification link got expired or you misplaced email. 
        Please confirm your email by clicking on the below link.
        Link will be valid for next <b>${OTP_EXPIRY / 1000} minutes<b>.
        </p>
        <a href='${verifyEmailUrl}?token=${otp}&email=${
        registeredUser.email
      }'>Verify email</a>
        `,
    });
    return res.status(200).send({
      message: 'Resent verification link, check email.',
    });
  } catch (err) {
    console.log('err while sending resend link: ', err);
    return res.status(500).send({
      message: 'Something went wrong',
    });
  }
};
