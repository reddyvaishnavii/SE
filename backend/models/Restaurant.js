const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: String,
  image: String,
  available: {
    type: Boolean,
    default: true
  }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cuisine: [String],
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  phone: String,
  menu: [menuItemSchema],
  deliveryTime: String,
  minOrder: Number,
  rating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving (same as user)
restaurantSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

restaurantSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model('Restaurant', restaurantSchema);