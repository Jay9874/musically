import { Client } from 'pg';
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  user: process.env.user,
  password: process.env.password,
  host: process.env.host,
  port: Number(process.env.port),
  database: process.env.database,
});

export { client };
