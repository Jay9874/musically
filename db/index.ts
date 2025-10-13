declare global {
  namespace NodeJS {
    interface ProcessEnv {
      user: string;
      password: string;
      host: string;
      port: number;
      database: string;
    }
  }
}

import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.user,
  password: process.env.password,
  host: process.env.host,
  port: process.env.port,
  database: process.env.database,
});

export { pool };
