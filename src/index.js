import mongoose from 'mongoose';
import { config } from './config.js';
import { connectDB } from './db.js';
import { createApp } from './app.js';

async function start() {
  try {
    await connectDB(config.mongoUri);
  } catch (err) {
    console.error(`[db] Could not connect to MongoDB at ${config.mongoUri.replace(/\/\/[^@]*@/, '//***@')}`);
    console.error(`[db] ${err.message}`);
    console.error('[db] Is MongoDB running? Check MONGODB_URI in backend/.env');
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[api] Listening on http://localhost:${config.port}`);
    console.log(`[api] Allowed origins: ${config.clientOrigins.join(', ') || '(none)'}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[api] Port ${config.port} is already in use. Set another PORT in backend/.env`);
    } else {
      console.error(err);
    }
    process.exit(1);
  });

  const shutdown = async (signal) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close();
    await mongoose.connection.close();
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
