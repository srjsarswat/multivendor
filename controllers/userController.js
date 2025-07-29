import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';

// Get current user's profile
export const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
};

// Update name/email
export const updateProfile = async (req, res) => {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'Profile updated', user });
};

// Update geolocation
export const updateUserLocation = async (req, res) => {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    // Check if user is a buyer
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: 'Only buyers can update location' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.location = {
        type: 'Point',
        coordinates: [lng, lat]
    };

    await user.save();
    res.json({ message: 'Location updated successfully' });
};

export const getMyShopWithProducts = async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ message: 'Access denied: not a seller' });
    }

    const shop = await Shop.findOne({ seller: req.user._id });
    if (!shop) return res.status(404).json({ message: 'Shop not found for seller' });

    const products = await Product.find({ shop: shop._id });

    res.json({
      shop,
      products
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get shop details' });
  }
};

// Admin: List all users
export const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
};
