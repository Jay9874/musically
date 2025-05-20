import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { client } from './db';

export function app(): express.Express {
  const server = express();
  server.use(express.json());
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  // Here, we now use the `AngularNodeAppEngine` instead of the `CommonEngine`
  const angularNodeAppEngine = new AngularNodeAppEngine();

  server.post('/api/register', async (req, res) => {
    try {
      const { email, password } = req.body;
      const values = [email, password];
      await client.connect();

      // First check if any user exists with this email
      const checkExistingUser =`SELECT email FROM users WHERE email = $1`;
      const user = await client.query(checkExistingUser, [email]);
      if (user.rows.length > 0) {
        await client.end()
        return res.status(409).send({
          data: null,
          error: `User already exists with ${user.rows[0].email}, try other email.`,
        });
      }
      const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING id, email, created_at;
    `;
      const result = await client.query(query, values);
      console.log('User added:', result.rows[0]);
      await client.end();
      return res.status(200).send({
        data: 'done',
        error: null,
      });
    } catch (err) {
      console.log('error: ', err);
      return res.status(500).json({
        data: null,
        error: 'Could not create user table.',
      });
    }
  });

  server.get(
    '**',
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    })
  );

  // With this config, /404 will not reach the Angular app
  server.get('/404', (req, res, next) => {
    res.send('Express is serving this server only error');
  });

  server.get('**', async (req, res, next) => {
    // Yes, this is executed in devMode via the Vite DevServer
    console.log('request', req.url, res.status);

    angularNodeAppEngine
      .handle(req, { server: 'express' })
      .then((response) =>
        response ? writeResponseToNodeResponse(response, res) : next()
      )
      .catch(next);
  });

  return server;
}

const server = app();
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:\${port}`);
  });
}

console.log('Node Express server started');

// This exposes the RequestHandler
export const reqHandler = createNodeRequestHandler(server);
