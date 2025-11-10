// src/utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token
const getToken = () => localStorage.getItem('token');
const getRestaurantToken = () => localStorage.getItem('restaurantToken');

// Helper function to handle API calls
const apiCall = async (endpoint, options = {}) => {
  console.log("🔍 Using API Base URL:", API_BASE_URL);

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add token if available
  const token = options.restaurantAuth ? getRestaurantToken() : getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  // User auth
  userRegister: (userData) =>
    apiCall('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  userLogin: (credentials) =>
    apiCall('/auth/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Restaurant auth
  restaurantRegister: (restaurantData) =>
    apiCall('/auth/restaurant/register', {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    }),

  restaurantLogin: (credentials) =>
    apiCall('/auth/restaurant/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// Restaurant API calls
export const restaurantAPI = {
  getAll: () => apiCall('/restaurants'),

  getById: (id) => apiCall(`/restaurants/${id}`),

  search: (query) => apiCall(`/restaurants/search/${query}`),

  update: (id, data) =>
    apiCall(`/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      restaurantAuth: true,
    }),

  // Menu management
  addMenuItem: (restaurantId, menuItem) =>
    apiCall(`/restaurants/${restaurantId}/menu`, {
      method: 'POST',
      body: JSON.stringify(menuItem),
      restaurantAuth: true,
    }),

  updateMenuItem: (restaurantId, menuItemId, menuItem) =>
    apiCall(`/restaurants/${restaurantId}/menu/${menuItemId}`, {
      method: 'PUT',
      body: JSON.stringify(menuItem),
      restaurantAuth: true,
    }),

  deleteMenuItem: (restaurantId, menuItemId) =>
    apiCall(`/restaurants/${restaurantId}/menu/${menuItemId}`, {
      method: 'DELETE',
      restaurantAuth: true,
    }),
};

// Order API calls
export const orderAPI = {
  create: (orderData) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getUserOrders: (userId) => apiCall(`/orders/user/${userId}`),

  getRestaurantOrders: (restaurantId) =>
    apiCall(`/orders/restaurant/${restaurantId}`, {
      restaurantAuth: true,
    }),

  updateStatus: (orderId, status) =>
    apiCall(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      restaurantAuth: true,
    }),
};

export default {
  authAPI,
  restaurantAPI,
  orderAPI,
};