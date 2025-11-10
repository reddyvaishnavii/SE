import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import './RestaurantMenu.css';

const CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Desserts',
  'Beverages',
  'Salads',
  'Soups',
  'Snacks',
  'Breakfast',
  'Sides'
];

const RestaurantMenu = () => {
  const { restaurant, isRestaurantLoggedIn } = useRestaurant();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    image: '',
    available: true
  });
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    if (!isRestaurantLoggedIn) {
      navigate('/restaurant-login');
      return;
    }
    fetchMenuItems();
  }, [isRestaurantLoggedIn, navigate]);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('restaurantToken');
      const response = await fetch('http://localhost:5001/api/restaurant/menu', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('restaurantToken');
    const url = editingItem 
      ? `http://localhost:5001/api/restaurant/menu/${editingItem._id}`
      : 'http://localhost:5001/api/restaurant/menu';
    
    const method = editingItem ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingItem ? 'Menu item updated!' : 'Menu item added!');
        fetchMenuItems();
        resetForm();
      } else {
        alert('Failed to save menu item');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image || '',
      available: item.available !== false
    });
    setShowAddModal(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    const token = localStorage.getItem('restaurantToken');
    try {
      const response = await fetch(`http://localhost:1/api/restaurant/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Menu item deleted!');
        fetchMenuItems();
      } else {
        alert('Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item');
    }
  };

  const toggleAvailability = async (item) => {
    const token = localStorage.getItem('restaurantToken');
    try {
      const response = await fetch(`http://localhost:5001/api/restaurant/menu/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...item, available: !item.available })
      });

      if (response.ok) {
        fetchMenuItems();
      }
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Main Course',
      image: '',
      available: true
    });
    setEditingItem(null);
    setShowAddModal(false);
  };

  const filteredItems = filterCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === filterCategory);

  if (loading) {
    return <div className="loading">Loading menu...</div>;
  }

  return (
    <div className="restaurant-menu-page">
      <div className="menu-container">
        <div className="menu-header">
          <div>
            <h1>Menu Management</h1>
            <p>Manage your restaurant's menu items</p>
          </div>
          <button className="add-item-btn" onClick={() => setShowAddModal(true)}>
            ➕ Add Menu Item
          </button>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <button 
            className={filterCategory === 'All' ? 'active' : ''}
            onClick={() => setFilterCategory('All')}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={filterCategory === category ? 'active' : ''}
              onClick={() => setFilterCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="no-items">
            <h2>📋 No menu items yet</h2>
            <p>Start building your menu by adding items</p>
          </div>
        ) : (
          <div className="menu-items-grid">
            {filteredItems.map(item => (
              <div key={item._id} className={`menu-item-card ${!item.available ? 'unavailable' : ''}`}>
                <div className="item-image">
                  <img 
                    src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'} 
                    alt={item.name}
                  />
                  {!item.available && <div className="unavailable-badge">Unavailable</div>}
                </div>
                <div className="item-details">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <p className="item-description">{item.description}</p>
                  <div className="item-footer">
                    <span className="item-price">${item.price?.toFixed(2)}</span>
                    <div className="item-actions">
                      <button 
                        className="toggle-btn"
                        onClick={() => toggleAvailability(item)}
                        title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                      >
                        {item.available ? '✓' : '✗'}
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(item)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(item._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
                <button className="close-btn" onClick={resetForm}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Item Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Margherita Pizza"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your dish..."
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.image && (
                    <div className="image-preview">
                      <img src={formData.image} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    />
                    Available for ordering
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={resetForm}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;