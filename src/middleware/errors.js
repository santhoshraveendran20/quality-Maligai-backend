import mongoose from 'mongoose';

export function notFound(req, res) {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.fromEntries(Object.entries(err.errors).map(([k, e]) => [k, e.message]));
    return res.status(400).json({ error: 'Please check the review details.', fields });
  }
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'This website is not allowed to use the API.' });
  }
  if (
    err instanceof mongoose.Error.MongooseServerSelectionError ||
    err.name === 'MongoNetworkError' ||
    /buffering timed out/i.test(err.message)
  ) {
    console.error('[db]', err.message);
    return res.status(503).json({ error: 'Database is unavailable. Please try again shortly.' });
  }

  console.error(err);
  res.status(err.status || 500).json({ error: 'Something went wrong on the server.' });
}
