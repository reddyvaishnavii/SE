import React, { createContext, useContext, useEffect, useState } from 'react';

const RestaurantContext = createContext(null);

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return ctx;
};

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Load restaurant session from localStorage on app start
  useEffect(() => {
    const t = localStorage.getItem('restaurantToken');
    const r = localStorage.getItem('restaurant');
    const role = localStorage.getItem('role');
    if (t && r && role === 'restaurant') {
      setRestaurant(JSON.parse(r));
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  // ✅ Restaurant login
  const login = (restaurantData, token) => {
    localStorage.setItem('restaurantToken', token);
    localStorage.setItem('restaurant', JSON.stringify(restaurantData));
    localStorage.setItem('role', 'restaurant');
    setRestaurant(restaurantData);
    setIsLoggedIn(true);
  };

  // ✅ Restaurant logout
  const logout = () => {
    localStorage.removeItem('restaurantToken');
    localStorage.removeItem('restaurant');
    if (localStorage.getItem('role') === 'restaurant') {
      localStorage.removeItem('role');
    }
    setRestaurant(null);
    setIsLoggedIn(false);
  };

  // ✅ Update restaurant data (used in RestaurantProfile)
  const updateRestaurantData = (updatedData) => {
    setRestaurant((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('restaurant', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        isLoggedIn,
        login,
        logout,
        loading,
        updateRestaurantData, // ✅ now defined properly
      }}
    >
      {!loading && children}
    </RestaurantContext.Provider>
  );
}
