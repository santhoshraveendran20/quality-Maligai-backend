import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { LIMITS, Review } from '../models/Review.js';
import { config } from '../config.js';

const router = Router();

// At most 5 new reviews per visitor every 15 minutes, to stop spam.
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many reviews from this device. Please try again later.' },
});

const clean = (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');

function validate(body = {}) {
  const errors = {};
  const name = clean(body.name);
  const place = clean(body.place);
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const rating = Number(body.rating);

  if (name.length < LIMITS.nameMin || name.length > LIMITS.nameMax) {
    errors.name = `Name must be ${LIMITS.nameMin}–${LIMITS.nameMax} characters.`;
  }
  if (place.length > LIMITS.placeMax) {
    errors.place = `Place must be at most ${LIMITS.placeMax} characters.`;
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Rating must be a whole number from 1 to 5.';
  }
  if (text.length < LIMITS.textMin || text.length > LIMITS.textMax) {
    errors.text = `Review must be ${LIMITS.textMin}–${LIMITS.textMax} characters.`;
  }

  return { errors, value: { name, place, rating, text } };
}

// GET /api/reviews?limit=50 – newest approved reviews first.
router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 }).limit(limit);
    res.json({ reviews: reviews.map((r) => r.toPublic()) });
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews – { name, place, rating, text }
router.post('/', postLimiter, async (req, res, next) => {
  try {
    const { errors, value } = validate(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: 'Please check the review details.', fields: errors });
    }
    const review = await Review.create({ ...value, approved: config.autoApprove });
    res.status(201).json({ review: review.toPublic(), approved: review.approved });
  } catch (err) {
    next(err);
  }
});

export default router;
