import dotenv from 'dotenv';
dotenv.config();

import { Request, Response, NextFunction, CookieOptions } from 'express';
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
    : `${process.env['LIVE_SERVER']}/auth/new-user`;

const recoverAccountUrl =
  process.env['NODE_ENV'] === 'development'
    ? 'http://localhost:4200/auth/reset-password'
    : `${process.env['LIVE_SERVER']}/auth/reset-password`;

/**
 *
 * @param req Express req object with body having email and password
 * @param res JSON with logged in user details and a session in cookie.
 * @param next
 * @returns Response to client.
 */
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
      text: 'SELECT email, username, roles, password, verified_email, id FROM users WHERE email=$1 OR username=$1',
      values: [email],
    };
    const emailResult = await pool.query(emailQuery);
    if (emailResult.rowCount === 0)
      return res.status(404).send({
        message:
          'Your email/username does not exists, please check it again or create a new account.',
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
        userId: user.id,
        username: user.username,
        roles: user.roles,
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

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const sessionId = req.cookies['musically-longterm'];
    if (!sessionId) {
      return res.status(400).send({
        message: 'You do not have an active session.',
      });
    }
    const deletedSession = await sessionManger.deleteSession(sessionId);
    if (!deletedSession) {
      return res.status(404).send({
        message: 'You could not logged out.',
      });
    }
    res.clearCookie('musically-longterm');
    res.clearCookie('musically-session');
    return res.status(200).send({
      message: 'The user logged out.',
    });
  } catch (err) {
    console.log('Err while logging out: ', err);
    return res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

/**
 * @description Register a new users with email, password and a username.
 * @param req Express request object with body having email, password, and username.
 * @param res A message to verify the email address.
 * @param next
 * @returns Response to client.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, username } = req.body;
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

    if (!username)
      return res.status(400).send({
        message:
          'You will need a unique username to create account, try again.',
      });

    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    const validUsername = usernamePattern.test(username as string);
    if (!validUsername) {
      return res.status(400).send({
        message:
          "Username should be alphanumeric. Special characters are '-' and '_'",
      });
    }
    // First check if any user exists with this email
    const checkExistingUser = `SELECT email FROM users WHERE email = $1`;
    const user = await pool.query(checkExistingUser, [email]);
    if (user.rows.length > 0) {
      return res.status(409).send({
        message: `You are already registered, please login.`,
      });
    }

    // Second check if the username is available
    let usernameToCheck: string = username as string;
    const checkExistingUsername = `SELECT username FROM users WHERE username = $1`;
    const hasUsername = await pool.query(checkExistingUsername, [
      usernameToCheck,
    ]);
    if (hasUsername.rows.length > 0) {
      return res.status(409).send({
        message: `A user with this username already exists, create new unique one.`,
      });
    }
    /* Any user does not exists with this email and username
      Hash the password and create a new user
     */
    const hash: string = await bcryptjs.hash(password, SALT_ROUND);
    /*
      Create an random 6 digit otp for email verification
    */
    const otp: string = Math.random().toString(36).slice(-8);
    const expires_at = new Date();
    expires_at.setTime(expires_at.getTime() + OTP_EXPIRY);
    const roles = ['normal'];

    const query = {
      text: 'INSERT INTO users (email, password, email_otp, otp_expires_at, roles, username) VALUES ($1, $2, $3, $4, $5, $6) RETURNING email, email_otp',
      values: [email, hash, otp, expires_at, roles, usernameToCheck],
    };

    const result = await pool.query(query);
    if (result.rowCount === 0)
      return res.status(403).send({
        message: 'Could not create users, try again.',
      });

    const registeredUser: { email: string; email_otp: string } = result.rows[0];
    await transporter
      .sendMail({
        from: process.env['GOOGLE_APP_EMAIL'],
        to: registeredUser.email,
        subject: 'Confirm your email for Musically',
        html: `<h4>Hello there,<h4> <br>
      <p>Thanks for signing up on Musically. 
      Please confirm your email by clicking on the below link.
      Link will be valid for next <b>${OTP_EXPIRY / (60 * 1000)} minutes<b>.
      </p>
      <a href='${verifyEmailUrl}?token=${registeredUser.email_otp}&email=${
          registeredUser.email
        }'>Verify email</a>
      `,
      })
      .catch((err) => {
        console.log('err occurred while sending mail: ', err);
        return res.status(400).send({
          message: 'The link could not be send, check email for correctness.',
        });
      })
      .then(() => {
        return res.status(200).send({
          message: 'User created, check email to proceed ahead.',
        });
      });
    return;
  } catch (err) {
    console.log('error: ', err);
    return res.status(500).json({
      message: 'Something went wrong',
    });
  }
};

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

    // Check if already existing recover request
    const existingToken = await pool.query(
      'SELECT username FROM users WHERE otp_expires_at > NOW()'
    );
    if (existingToken.rowCount !== 0) {
      return res.status(409).send({
        message:
          'You already have a recover request, complete it with old link.',
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
    await transporter
      .sendMail({
        from: process.env['GOOGLE_APP_EMAIL'],
        to: registeredUser.email,
        subject: 'Confirm your email for Musically',
        html: `<h4>Hello there,<h4>
        <p>No need to worry if your verification link got expired or you misplaced email. 
        Please confirm your email by clicking on the below link.
        Link will be valid for next <b>${OTP_EXPIRY / (60 * 1000)} minutes<b>.
        </p>
        <a href='${verifyEmailUrl}?token=${otp}&email=${
          registeredUser.email
        }'>Verify email</a>
        `,
      })
      .catch((err) => {
        console.log('err occurred while sending mail: ', err);
        return res.status(400).send({
          message: 'The link could not be send, check email for correctness.',
        });
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

export const recoverAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        message: 'Provide an email to send recovery email.',
      });
    }
    // Check if email exists in the database
    const validEmail = {
      text: 'SELECT email FROM users WHERE email=$1',
      values: [email],
    };

    const existingEmail = await pool.query(validEmail);
    if (existingEmail.rowCount === 0) {
      return res.status(404).send({
        message: 'Your email does not exits, please register first.',
      });
    }
    // Check if already existing recover request
    const existingToken = await pool.query(
      'SELECT username FROM users WHERE otp_expires_at > NOW()'
    );
    if (existingToken.rowCount !== 0) {
      return res.status(409).send({
        message:
          'You already have a recover request, complete it with old link.',
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
        message: 'Could not send recovery email, try again.',
      });

    const registeredUser: { email: string; token: string } = result.rows[0];
    await transporter
      .sendMail({
        from: process.env['GOOGLE_APP_EMAIL'],
        to: registeredUser.email,
        subject: 'Recover your account',
        html: `<h4>Hello there,<h4>
        <p>No need to worry if you forgot password. 
        Please set a new password by clicking on the below link.
        Link will be valid for next <b>${OTP_EXPIRY / (60 * 1000)} minutes<b>.
        </p>
        <a href='${recoverAccountUrl}?token=${registeredUser.token}&email=${
          registeredUser.email
        }'>Verify email</a>
        `,
      })
      .catch((err) => {
        console.log('err occurred while sending mail: ', err);
        return res.status(400).send({
          message: 'The link could not be send, check email for correctness.',
        });
      })
      .then(() => {
        return res.status(200).send({
          message: 'Sent a recovery link, check email.',
        });
      });
  } catch (err) {
    console.log('err while recovering account: ', err);
    return res.status(500).send({
      message: 'Something went wrong',
    });
  }
};

export const usernameAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const username: string | undefined = req.query['username'] as
      | string
      | undefined;
    if (!username) {
      return res.status(400).send({
        message: 'Please provide a username to check availability.',
      });
    }
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    const validUsername = usernamePattern.test(username as string);
    if (!validUsername) {
      return res.status(400).send({
        message:
          "Username should be alphanumeric. Special characters are '-' and '_'",
      });
    }

    const query = {
      text: 'SELECT username FROM users WHERE username=$1',
      values: [username],
    };
    const result = await pool.query(query);
    if (result.rowCount !== 0) {
      return res.status(409).send({
        message: 'Uh-oh! someone took this username, try other one.',
      });
    }
    return res.status(200).send({
      message: 'Wow! the username is available.',
    });
  } catch (err) {
    console.log('err occurred at availability check : ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, email, token } = req.body;
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

    if (!token)
      return res.status(400).send({
        message:
          'No token found in recovery link, try again or create a new request.',
      });

    // First check if any user exists with this email
    const checkExistingUser = {
      text: 'SELECT email FROM users WHERE email = $1',
      values: [email],
    };
    const existingUser = await pool.query(checkExistingUser);
    if (existingUser.rowCount === 0) {
      return res.status(404).send({
        message: `Email is invalid, provide a correct email.`,
      });
    }

    // First check if any user exists with this email
    const validTokenQuery = {
      text: 'SELECT email FROM users WHERE email = $1 AND email_otp=$2 AND otp_expires_at > NOW()',
      values: [email, token],
    };
    const validToken = await pool.query(validTokenQuery);
    if (validToken.rowCount === 0) {
      return res.status(403).send({
        message: `The link is expired or invalid. Create a new request.`,
      });
    }

    /* Any user does not exists with this email and username
      Hash the password and create a new user
     */
    const hash: string = await bcryptjs.hash(password, SALT_ROUND);

    const updatePasswordQuery = {
      text: 'UPDATE users SET password=$1 RETURNING email, username, roles, id',
      values: [hash],
    };

    const result = await pool.query(updatePasswordQuery);
    if (result.rowCount === 0)
      return res.status(403).send({
        message: 'Could not update password, try again.',
      });

    const user: DbUser = result.rows[0];
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
        userId: user.id,
        username: user.username,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.log('error: ', err);
    return res.status(500).json({
      message: 'Something went wrong.',
    });
  }
};

export const changeUsername = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { newUsername } = req.body;
    if (!newUsername) {
      return res.status(400).send({
        message: 'Please provide new username.',
      });
    }
    const { userId } = res.locals;
    const query = {
      text: 'UPDATE users SET username=$1 WHERE id=$2 RETURNING email, id, username, roles',
      values: [newUsername, userId],
    };

    const updatedUser = await pool.query(query);
    if (updatedUser.rowCount === 0) {
      return res.status(404).send({
        message: 'User could not be found.',
      });
    }
    const user: DbUser = updatedUser.rows[0];
    return res.status(200).send({
      user: {
        email: user.email,
        userId: user.id,
        username: user.username,
        roles: user.roles,
      },
    });
  } catch (err) {
    console.log('err occurred while changing username: ', err);
    return res.status(500).send({
      message: 'Something went wrong.',
    });
  }
};
