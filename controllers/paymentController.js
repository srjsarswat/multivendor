import Razorpay from 'razorpay';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
  const buyerId = req.user._id;

  const cart = await Cart.findOne({ buyer: buyerId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // ✅ Calculate total from DB product prices
  const totalAmount = cart.items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const razorpayOrder = await razorpay.orders.create({
    amount: totalAmount * 100, // Razorpay expects paise
    currency: 'INR',
    receipt: `order_rcpt_${Date.now()}`,
  });

  res.status(200).json({ order: razorpayOrder });
};

export const verifyPaymentAndCreateOrder = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const buyerId = req.user._id;

  const cart = await Cart.findOne({ buyer: buyerId }).populate({
    path: 'items.product',
    populate: { path: 'shop seller' },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Group items by seller/shop
  const groupedOrders = {};

  cart.items.forEach((item) => {
    const sellerId = item.product.shop.seller._id.toString();
    if (!groupedOrders[sellerId]) groupedOrders[sellerId] = [];

    groupedOrders[sellerId].push({
      product: item.product._id,
      quantity: item.quantity,
      shop: item.product.shop._id,
    });
  });

  const createdOrders = [];

  for (const [sellerId, items] of Object.entries(groupedOrders)) {
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      total += product.price * item.quantity;
    }

    const newOrder = new Order({
      buyer: buyerId,
      seller: sellerId,
      shop: items[0].shop,
      items,
      totalAmount: total,
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
    });

    await newOrder.save();
    createdOrders.push(newOrder);
  }

  await Cart.findOneAndDelete({ buyer: buyerId });

  res.status(201).json({ message: 'Payment verified and order placed', orders: createdOrders });
};