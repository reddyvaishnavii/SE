import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import UserRegister from './components/Auth/UserRegister';
import UserLogin from './components/Auth/UserLogin';
import RestaurantList from './components/Restaurant/RestaurantList';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          {/* Navigation */}
          <nav className="navbar">
            <div className="container">
              <Link to="/" className="nav-brand">Welcome to FoodieHub 🍔</Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/user/register" className="nav-link">Register</Link>
                <Link to="/user/login" className="nav-link">Login</Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <Routes>
              <Route path="/" element={<RestaurantList />} />
              <Route path="/user/register" element={<UserRegister />} />
              <Route path="/user/login" element={<UserLogin />} />
              {/* We'll add more routes as we create components */}
            </Routes>
          </main>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;