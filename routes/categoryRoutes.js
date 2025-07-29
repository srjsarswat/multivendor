// routes/categoryRoutes.js
import express from 'express';

const router = express.Router();

const ALLOWED_CATEGORIES = [
  'electronics',
  'fashion',
  'books',
  'home',
  'beauty',
  'toys',
  'sports',
  'grocery',
  'automotive',
  'stationery',
  'furniture',
  'jewelry',
];

router.get('/', (req, res) => {
  res.json(ALLOWED_CATEGORIES);
});

export default router;
