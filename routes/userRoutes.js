import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkRole } from '../middleware/roleMiddleware.js';
import {
  getProfile,
  updateProfile,
  updateUserLocation,
  getAllUsers,
  getMyShopWithProducts 
} from '../controllers/userController.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/update', protect, updateProfile);
router.put('/location', protect, updateUserLocation);
router.get('/my-shop', protect, checkRole('seller'), getMyShopWithProducts);


// Admin-only: view all users
router.get('/all', protect, checkRole('admin'), getAllUsers);

export default router;
