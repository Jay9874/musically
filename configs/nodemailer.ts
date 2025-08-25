import dotenv from 'dotenv';
dotenv.config();

import nodemailer from 'nodemailer';

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: process.env['NODEMAILER_HOST'],
  port: Number(process.env['NODEMAILER_PORT']),
  secure: true,
  auth: {
    user: process.env['GOOGLE_APP_EMAIL'],
    pass: process.env['GOOGLE_APP_PASSWORD'],
  },
});

export default transporter;
