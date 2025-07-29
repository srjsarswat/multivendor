import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: Number,
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true,
  }
});

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  payment: {
    orderId: String,
    paymentId: String,
    signature: String,
    status: {
      type: String,
      enum: ['success', 'failed'], // ✅ valid values
    }
  },
  status: {
    type: String,
    enum: ['placed', 'shipped', 'delivered', 'cancelled'], // ✅ lowercase 'placed'
    default: 'placed'
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
