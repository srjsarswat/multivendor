import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';

// GET /api/admin/buyers
export const getAllBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' }).select('-password'); // hide password
    res.status(200).json(buyers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyers', error: err.message });
  }
};

export const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).select('-password');
    res.status(200).json(sellers);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sellers' });
  }
};


export const getAllSellersWithShops = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .select('-password')
      .lean();

    // Fetch and attach shop for each seller
    const sellersWithShops = await Promise.all(
      sellers.map(async (seller) => {
        const shop = await Shop.findOne({ seller: seller._id });
        return {
          ...seller,
          shop: shop || null,
        };
      })
    );

    res.status(200).json(sellersWithShops);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sellers', error: err.message });
  }
};



// ✔ Sellers + shop + products
export const getAllSellersWithShopsAndProducts = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).select('-password').lean();

    const result = await Promise.all(
      sellers.map(async (seller) => {
        const shop = await Shop.findOne({ seller: seller._id }).lean();
        const products = shop ? await Product.find({ shop: shop._id }) : [];
        return { ...seller, shop, products };
      })
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sellers and products' });
  }
};

// ✔ Single seller detail with shop
export const getSellerDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select('-password');
    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const shop = await Shop.findOne({ seller: seller._id });
    const products = shop ? await Product.find({ shop: shop._id }) : [];

    res.status(200).json({ seller, shop, products });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch seller details' });
  }
};

export const getBuyerDetails = async (req, res) => {
  try {
    const buyer = await User.findOne({ _id: req.params.id, role: 'buyer' }).select('-password');
    if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

    res.status(200).json(buyer);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer details' });
  }
};