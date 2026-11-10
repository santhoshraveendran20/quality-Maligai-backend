import 'dotenv/config';

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((s) => s.trim().replace(/^["']|["']$/g, '').replace(/\/$/, ''))
    .filter(Boolean);

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quality-store',
  // Sites allowed to call the API from the browser: the live website and the Vite dev server,
  // plus any extra comma-separated URLs in CLIENT_ORIGIN (or CLIENT_URL).
  clientOrigins: [
    ...new Set([
      'https://quality-maligai-frontend.vercel.app',
      'https://qualityqualitymaligai.in',
      'https://www.qualityqualitymaligai.in',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      ...toList(process.env.CLIENT_ORIGIN),
      ...toList(process.env.CLIENT_URL),
    ]),
  ],
  // Number of proxies in front of the server (e.g. 1 on Render/Railway/Nginx). 0 when run directly.
  trustProxy: Number(process.env.TRUST_PROXY) || 0,
  // true: new reviews show on the site straight away. false: they wait until approved in the database.
  autoApprove: process.env.AUTO_APPROVE_REVIEWS !== 'false',
  isProduction: process.env.NODE_ENV === 'production',
  // Folder with the built website to serve (optional). Default: ../frontend/dist
  frontendDist: process.env.FRONTEND_DIST || '',
};
