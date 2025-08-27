import dotenv from 'dotenv';
dotenv.config();

import { Session } from '../types/interfaces/interfaces.session';
import { pool } from '../db';

export class SessionManager {
  // The default session timeout
  // readonly because can be only set through constructor
  readonly expiry_duration: number = Number(process.env['SESSION_EXPIRY']);
  constructor(expiry_duration?: number) {
    if (expiry_duration !== undefined) {
      this.expiry_duration = expiry_duration;
    }
  }

  async createSession(userId: number): Promise<Session | null> {
    try {
      const currentTime: Date = new Date();
      const expiryTime: Date = new Date(
        currentTime.getTime() + this.expiry_duration
      );
      const query = {
        text: 'INSERT INTO sessions(userId, expires_at) VALUES($1, $2) RETURNING *',
        values: [userId, expiryTime],
      };

      const result = await pool.query(query);
      if (result.rowCount === 0) return null;
      console.log('the session created: ', result.rows[0]);
      return result.rows[0];
    } catch (err) {
      console.log('error while creating session: ', err);
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
