const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // 7 days - you can use: '1h', '24h', '7d', '30d'
  });
};

// User registration
router.post('/user/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User login
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user._id);

    res.json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Restaurant registration
router.post('/restaurant/register', async (req, res) => {
  try {
    const { name, email, password, phone, cuisine, address } = req.body;
    
    const restaurantExists = await Restaurant.findOne({ email });
    if (restaurantExists) {
      return res.status(400).json({ message: 'Restaurant already exists' });
    }

    const restaurant = await Restaurant.create({
      name,
      email,
      password,
      phone,
      cuisine,
      address
    });

    const token = signToken(restaurant._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Restaurant login
router.post('/restaurant/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const restaurant = await Restaurant.findOne({ email }).select('+password');
    
    if (!restaurant || !(await restaurant.correctPassword(password, restaurant.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(restaurant._id);

    res.json({
      status: 'success',
      token,
      data: {
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          email: restaurant.email
        }
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;