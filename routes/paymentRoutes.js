// routes/paymentRoutes.js
import express from 'express';
import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import User from '../models/User.js';

const router = express.Router();

// ✅ Create Razorpay Order
router.post('/create-order', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyer: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    const options = {
      amount: totalAmount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error('Create Razorpay order failed:', err);
    res.status(500).json({ error: 'Payment order creation failed' });
  }
});

// ✅ Verify Razorpay Payment and Place Order
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Get cart and populate product → shop → seller
    const cart = await Cart.findOne({ buyer: req.user._id }).populate({
      path: 'items.product',
      populate: {
        path: 'shop',
        populate: {
          path: 'seller',
          model: 'User',
        }
      }
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Prepare order items with seller/shop references
    const orderItems = cart.items.map((item) => {
      const product = item.product;
      const shop = product.shop;
      const seller = shop?.seller;

      if (!shop || !seller) {
        throw new Error('Missing shop or seller info in product');
      }

      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        shop: shop._id,
        seller: seller._id
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      buyer: req.user._id,
      items: orderItems,
      totalAmount,
      payment: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'success'
      },
      status: 'placed'
    });

    await newOrder.save();
    await Cart.findOneAndDelete({ buyer: req.user._id });

    res.json({
      success: true,
      message: 'Payment verified and order placed',
      order: newOrder
    });
  } catch (err) {
    console.error('Payment verification failed:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

export default router;
