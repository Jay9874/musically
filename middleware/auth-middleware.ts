import { Request, Response, NextFunction } from 'express';
import { SessionManager } from '../utils/sessionManager';
import { Session } from '../types/interfaces/interfaces.session';

// @desc Authenticates user and protects routes

const sessionManger = new SessionManager();

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    const sessionId: unknown = req.cookies;
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
    return res.status(200).send({
      session: session,
    });
  } catch (err) {
    console.log('err at authenticating user: ', err);
    return res.status(200).send({
      message: 'Something went wrong.',
    });
  }
};
