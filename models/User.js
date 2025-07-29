import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },

  // Location only relevant for 'buyer'
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: undefined // undefined if not buyer
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: undefined
    }
  }
});

// Enable geospatial search for buyers
userSchema.index({ location: '2dsphere' });

// Password hashing
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Match password method
userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
