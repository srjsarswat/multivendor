import Shop from '../models/Shop.js';

export const createShop = async (req, res) => {
  const { name, address, lat, lng } = req.body;

  const existing = await Shop.findOne({ seller: req.user._id });
  if (existing) return res.status(400).json({ message: 'Shop already exists' });

  const shop = await Shop.create({
    seller: req.user._id,
    name,
    address,
    location: { type: 'Point', coordinates: [lng, lat] }
  });

  res.status(201).json({ shop });
};
