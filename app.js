const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurantRoutes');
const feedbackRoutes = require('./routes/Feedback');

const app = express();

/** ✅ CORS Configuration */
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /^http:\/\/10\.\d+\.\d+\.\d+:3000$/.test(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** ✅ Routes */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/support', require('./routes/Support'));

/** ✅ Root + Health */
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.json({ message: 'Food Delivery API', version: '1.0.0' }));

/** ✅ Error & 404 handlers */
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));
app.use((err, req, res, next) => res.status(500).json({ error: err.message }));

// ✅ Export only the app (NOT app.listen)
module.exports = app;
