# Quality & Quality – Backend (reviews API)

Express + MongoDB (Mongoose) API for the customer reviews shown on the website in `../frontend`.

## Run it

You need [Node.js 20+](https://nodejs.org) and MongoDB – either
[MongoDB Community Server](https://www.mongodb.com/try/download/community) on your computer or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
npm install
npm run dev     # http://localhost:5000, restarts when files change
npm start       # production
```

Settings are in `.env` (a copy of `.env.example` with local defaults is included; `.env` is not
committed to git). For MongoDB Atlas, put your connection string in `MONGODB_URI`.

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `5000` | API port (the frontend dev server forwards `/api` here) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/quality-store` | MongoDB connection string |
| `CLIENT_ORIGIN` | `http://localhost:5173,http://127.0.0.1:5173` | Websites allowed to call the API (comma separated) |
| `TRUST_PROXY` | `0` | Set to `1` behind Render/Railway/Nginx so the rate limit sees real visitor IPs |
| `AUTO_APPROVE_REVIEWS` | `true` | `false` = new reviews wait until you set `approved: true` in MongoDB |
| `FRONTEND_DIST` | `../frontend/dist` | Built website to serve from this server (used only if the folder exists) |

## API

| Method | Path | Body / query | Response |
| --- | --- | --- | --- |
| GET | `/api/health` | – | `{ status, db }` |
| GET | `/api/reviews` | `?limit=50` (max 100) | `{ reviews: [{ id, name, place, rating, text, createdAt }] }`, newest first |
| POST | `/api/reviews` | `{ name, place, rating, text }` | `201 { review, approved }` · `400 { error, fields }` · `429` too many |

- Validation matches the website form: name 2–40 characters, place up to 40, rating 1–5, review 10–300.
- At most 5 reviews per visitor every 15 minutes.
- Only the sites in `CLIENT_ORIGIN` may call the API from a browser.

## Deploy

- **API only** (website hosted on Vercel/Netlify): deploy this folder on Render, Railway or a VPS
  with start command `npm start`. Set `MONGODB_URI`, `NODE_ENV=production`, `TRUST_PROXY=1` and
  `CLIENT_ORIGIN=https://your-website-domain`.
- **API + website on one server**: build the frontend (`cd ../frontend && npm install && npm run build`),
  then `npm start` here – it serves `/api/*` and the website from `../frontend/dist`.

## Structure

```
src/
  index.js                 starts the server after connecting to MongoDB
  app.js                   Express app: CORS, JSON, routes, optional website hosting
  config.js                settings from .env
  db.js                    MongoDB connection
  models/Review.js         review schema
  routes/reviews.js        GET/POST /api/reviews
  middleware/errors.js     404 and error responses
```
