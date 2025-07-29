// routes/cartRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
  setCartItemQuantity,
} from '../controllers/cartController.js';

const router = express.Router();

router.use(protect, checkRole('buyer')); // Only buyers

router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);
router.post('/set-quantity', setCartItemQuantity);

export default router;
