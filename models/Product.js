import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String, required: true }],
  stock: { type: Number, required: true },

  category: {
    type: String,
    required: true,
    enum: [
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
    ],
  },

  isTrending: { type: Boolean, default: false },
  isMostBought: { type: Boolean, default: false },

  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }
});

export default mongoose.model('Product', productSchema);
