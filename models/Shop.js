import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  }
});

shopSchema.index({ location: '2dsphere' });

export default mongoose.model('Shop', shopSchema);
