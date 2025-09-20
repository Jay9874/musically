import dotenv from 'dotenv';
dotenv.config();

import { Session, SessionUser } from '../types/interfaces/interfaces.session';
import { pool } from '../db';

export class SessionManager {
  // The default session timeout
  // readonly because can be only set through constructor
  readonly expiry_duration: number = Number(process.env['SESSION_EXPIRY_MS']);
  constructor(expiry_duration?: number) {
    if (expiry_duration !== undefined) {
      this.expiry_duration = expiry_duration;
    }
  }

  async createSession(userId: number): Promise<Session | null> {
    try {
      const expiryTime: Date = new Date();
      expiryTime.setTime(expiryTime.getTime() + this.expiry_duration);

      const query = {
        text: 'INSERT INTO sessions(userId, expires_at) VALUES($1, $2) ON CONFLICT(userId) DO UPDATE SET expires_at=EXCLUDED.expires_at RETURNING *',
        values: [userId, expiryTime],
      };

      const result = await pool.query(query);
      if (result.rowCount === 0) return null;

      return result.rows[0];
    } catch (err) {
      console.log('error while creating session: ', err);
      return null;
    }
  }

  async checkSession(sessionId: number): Promise<Session | null> {
    try {
      const query = {
        text: 'SELECT userid, username, sessions.id, roles, email FROM sessions JOIN users ON userid=users.id AND sessions.id=$1 AND expires_at > NOW()',
        values: [sessionId],
      };

      const result = await pool.query(query);
      if (result.rowCount === 0) {
        return null;
      }
      const user: SessionUser | null = {
        userId: result.rows[0].userid,
        email: result.rows[0].email,
        roles: result.rows[0].roles,
        username: result.rows[0].username,
      };
      const session: Session = {
        id: result.rows[0].id,
        user: user,
      };
      return session;
    } catch (err) {
      console.log('err while checking session: ', err);
      return null;
    }
  }

  async deleteSession(sessionId: number): Promise<boolean> {
    try {
      const query = {
        text: 'DELETE FROM sessions WHERE id=$1',
        values: [sessionId],
      };

      const result = await pool.query(query);
      if (result.rowCount === 0) return false;
      return true;
    } catch (err) {
      console.log('error occurred while deleting session: ', err);
      return false;
    }
  }
}
