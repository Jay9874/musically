import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';

// All the routes
import { authRouter } from './routes/auth';
import { consoleRouter } from './routes/console';
import { musicRouter } from './routes/music';
import { authenticate, authorize } from './middleware/auth-middleware';
import { pool } from './db';

export function app(): express.Express {
  const server = express();
  server.use(express.json());
  server.use(cookieParser());
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');

  // Here, we now use the `AngularNodeAppEngine` instead of the `CommonEngine`
  const angularNodeAppEngine = new AngularNodeAppEngine();

  server.get(
    '/api/test',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        return res.status(200).send({
          message: 'Got the request, hurrrraah...',
        });
      } catch (err) {
        console.log('err while testing api status: ', err);
        return next(err);
      }
    }
  );
  server.use('/api/auth', authRouter);
  server.use(
    '/api/admin/console',
    authenticate,
    authorize(['admin']),
    consoleRouter
  );

  server.use('/api/music', musicRouter);

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

  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log('error: ', err);
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong' });
  };

  server.use(errorHandler);

  return server;
}

// const server = app();
// if (isMainModule(import.meta.url)) {
//   const port = process.env['PORT'] || 4000;
//   server.listen(port, () => {
//     console.log(`Node Express server listening on http://localhost:\${port}`);
//   });
// }

const server = app();
function run(): void {
  const port = process.env['PORT'] || 4000;
  // Start up the Node server
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
    pool
      .connect()
      .then(() => console.log('Connected to PostgreSQL'))
      .catch((err) => console.error('DB Connection Error:', err));
  });
}

//run();

// This exposes the RequestHandler
export const reqHandler = createNodeRequestHandler(server);
