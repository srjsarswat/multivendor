import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import User from '../models/User.js';
const ALLOWED_CATEGORIES = [
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
];

export const createProduct = async (req, res) => {
  const { name, description, price, stock, category, images } = req.body;

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: 'Invalid category' });
  }

  const shop = await Shop.findOne({ seller: req.user._id });
  if (!shop) return res.status(400).json({ message: 'Create a shop first' });

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category,
    images,
    shop: shop._id,
  });

  res.status(201).json({ product });
};


export const getNearbyProducts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can fetch nearby products' });
    }

    if (!user.location || !user.location.coordinates) {
      return res.status(400).json({ message: 'Buyer location not set' });
    }

    const radius = parseFloat(req.query.radius) || 10000; // default 10km

    const shops = await Shop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: radius
        }
      }
    });

    const shopIds = shops.map(s => s._id);

    const products = await Product.find({ shop: { $in: shopIds } }).populate('shop');
    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch nearby products' });
  }
};


export const searchNearbyProductByName = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can search nearby' });
    }

    if (!user.location || !user.location.coordinates) {
      return res.status(400).json({ message: 'Buyer location not set' });
    }

    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Search query is required' });

    const radius = parseFloat(req.query.radius) || 10000; // default 10km

    const shops = await Shop.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: user.location.coordinates
          },
          $maxDistance: radius
        }
      }
    });

    const shopIds = shops.map(s => s._id);

    const products = await Product.find({
      shop: { $in: shopIds },
      name: { $regex: query, $options: 'i' }
    }).populate('shop');

    res.json(products);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to search nearby products' });
  }
};
