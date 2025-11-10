import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';

export default function RoleRoute({ role, children }) {
  const { isLoggedIn: userIn, role: userRole } = useAuth();
  const { isLoggedIn: restIn } = useRestaurant();

  if (role === 'user') {
    if (!userIn || userRole !== 'user') return <Navigate to="/login" replace />;
    return children;
  }
  if (role === 'restaurant') {
    if (!restIn) return <Navigate to="/restaurant-login" replace />;
    return children;
  }
  return <Navigate to="/" replace />;
}
