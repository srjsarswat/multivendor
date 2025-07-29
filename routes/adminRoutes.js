import express from 'express';
import { getAllBuyers, getAllSellersWithShops, getAllSellersWithShopsAndProducts, getSellerDetails, getAllSellers, getBuyerDetails } from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// GET /api/admin/buyers
router.get('/buyers', protect, checkRole('admin'), getAllBuyers);
router.get('/sellers', protect, checkRole('admin'), getAllSellers);
router.get('/sellers-with-shop', protect, checkRole('admin'), getAllSellersWithShops);
router.get('/sellers-with-products', protect, checkRole('admin'), getAllSellersWithShopsAndProducts);
router.get('/seller/:id', protect, checkRole('admin'), getSellerDetails);
router.get('/buyer/:id', protect, checkRole('admin'), getBuyerDetails);
router.get('/orders', protect, checkRole('admin'), getAllOrders);
router.patch('/orders/:orderId/status', protect, checkRole('admin'), updateOrderStatus);

export default router;
