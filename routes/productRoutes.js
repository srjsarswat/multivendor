import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import {
  createProduct,
  getNearbyProducts,
  searchNearbyProductByName
} from '../controllers/productController.js';

const router = express.Router();
router.post('/create', protect, checkRole('seller'), createProduct);

// Buyer: All nearby products
router.get('/nearby', protect, checkRole('buyer'), getNearbyProducts);

// Buyer: Search by name nearby
router.get('/search', protect, checkRole('buyer'), searchNearbyProductByName);


export default router;
