import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await API.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const searchRestaurants = async () => {
    try {
      const response = await API.get(`/restaurants/search/${searchQuery}`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search restaurants or dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={searchRestaurants}>Search</button>
      </div>
      
      <div className="restaurant-list">
        {restaurants.map(restaurant => (
          <div key={restaurant._id} className="restaurant-card">
            <h3>{restaurant.name}</h3>
            <p>Cuisine: {restaurant.cuisine.join(', ')}</p>
            <p>Delivery Time: {restaurant.deliveryTime}</p>
            <p>Rating: {restaurant.rating} ⭐</p>
            <button onClick={() => {/* Navigate to restaurant details */}}>
              View Menu
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;