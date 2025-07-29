// routes/orderRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyOrders } from '../controllers/orderController.js';

const router = express.Router();

// GET /api/orders/my
router.get('/my', protect, getMyOrders);

export default router;
