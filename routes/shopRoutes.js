import express from 'express';
import { createShop } from '../controllers/shopController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';

const router = express.Router();
router.post('/create', protect, checkRole('seller'), createShop);

export default router;
