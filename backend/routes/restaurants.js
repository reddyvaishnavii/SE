const express = require('express');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find().select('-password');
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select('-password');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add menu item (Restaurant owner only)
router.post('/:id/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.menu.push(req.body);
    await restaurant.save();

    res.status(201).json(restaurant.menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update menu item
router.put('/:id/menu/:menuItemId', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const menuItem = restaurant.menu.id(req.params.menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    Object.assign(menuItem, req.body);
    await restaurant.save();

    res.json(menuItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search restaurants and dishes
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { cuisine: { $regex: query, $options: 'i' } },
        { 'menu.name': { $regex: query, $options: 'i' } }
      ]
    }).select('-password');

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;