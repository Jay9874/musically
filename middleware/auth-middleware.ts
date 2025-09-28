import { Request, Response, NextFunction } from 'express';
import { SessionManager } from '../utils/sessionManager';
import { Session, SessionUser } from '../types/interfaces/interfaces.session';
import { pool } from '../db';
import { Roles } from '../types/interfaces/interfaces.user';

// @desc Authenticates user and protects routes

const sessionManger = new SessionManager();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const sessionId: unknown = req.cookies['musically-longterm'];
    if (!sessionId) {
      return res.status(401).send({
        message: 'You are not authenticated.',
      });
    }
    const session: Session | null = await sessionManger.checkSession(
      sessionId as number
    );
    if (!session) {
      return res.status(401).send({
        message: 'Your session seems to have expired.',
      });
    }
    res.locals = {
      userId: session.user.userId,
    };
    next();
  } catch (err) {
    console.log('err at authenticating user: ', err);
    return res.status(200).send({
      message: 'Something went wrong.',
    });
  }
};

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const sessionId: unknown = req.cookies['musically-session'];
    let user: SessionUser | null = null;
    if (sessionId) {
      const session: Session | null = await sessionManger.checkSession(
        sessionId as number
      );
      if (session) {
        user = session.user;
      }
    }
    return res.status(200).send({
      user: user,
    });
  } catch (err) {
    console.log('err at authenticating user: ', err);
    return res.status(200).send({
      message: 'Something went wrong.',
    });
  }
};

export const authorize = function (validRoles: Roles[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | any> => {
    try {
      // Getting logged user info from auth middleware
      const loggedUser = res.locals['userId'];

      const rolesQuery = {
        text: 'SELECT roles FROM users WHERE id=$1',
        values: [loggedUser],
      };
      const result = await pool.query(rolesQuery);
      if (result.rowCount === 0) {
        return res.status(404).send({
          message: 'Seems you do not have access to perform this action.',
        });
      }
      const user: SessionUser = result.rows[0];
      const hasAccess: boolean = validRoles.some((role) =>
        user.roles.includes(role)
      );
      console.log('has access: ', hasAccess);
      if (!hasAccess) {
        return res.status(403).send({
          message: 'You are unauthorized to perform this action.',
        });
      }
      next();
    } catch (err) {
      console.log('err while checking the role');
      return res.status(500).send({
        message: 'Something went wrong',
      });
    }
  };
};
