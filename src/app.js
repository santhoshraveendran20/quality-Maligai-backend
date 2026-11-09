import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { isDBConnected } from './db.js';
import reviewsRouter from './routes/reviews.js';
import { errorHandler, notFound } from './middleware/errors.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', config.trustProxy);

  app.use(
    cors({
      origin(origin, cb) {
        // Requests without an Origin header (curl, same-origin, server-to-server) are allowed.
        if (!origin || config.clientOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
        cb(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST'],
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (req, res) => {
    const db = isDBConnected();
    res.status(db ? 200 : 503).json({ status: db ? 'ok' : 'degraded', db: db ? 'connected' : 'disconnected' });
  });
  app.use('/api/reviews', reviewsRouter);
  app.use('/api', notFound);

  // Optional: after `npm run build` in ../frontend, this server also serves the website,
  // so the whole site runs from one Node process. Override the folder with FRONTEND_DIST.
  const dist = config.frontendDist || fileURLToPath(new URL('../../frontend/dist', import.meta.url));
  if (existsSync(dist)) {
    app.use(express.static(dist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => res.sendFile('index.html', { root: dist }));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
