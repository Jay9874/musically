declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URI: string;
    }
  }
}

import * as dotenv from 'dotenv';
dotenv.config();
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URI,
});

export { pool };
