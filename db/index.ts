declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URI: string;
      DATABASE_URL: string;
    }
  }
}

import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const DB =
  process.env['NODE_ENV'] === 'production'
    ? process.env.DATABASE_URL
    : process.env.DB_URI;
const pool = new Pool({
  connectionString: DB,
});

export { pool };
