import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Feedback.css';

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const order = location.state?.order;

  const [formData, setFormData] = useState({
    rating: 0,
    foodQuality: 0,
    deliveryTime: 0,
    comment: ''
  });
  const [hoveredStar, setHoveredStar] = useState({ rating: 0, foodQuality: 0, deliveryTime: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!order) {
      navigate('/orders');
    }
  }, [order, navigate]);

  const handleStarClick = (category, value) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      setError('Please provide an overall rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order._id,
          userId: user.id,
          restaurantId: order.restaurant._id,
          ...formData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit feedback');
      }

      alert('Thank you for your feedback! 🎉');
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ category, label }) => (
    <div className="rating-section">
      <label>{label}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoveredStar[category] || formData[category]) ? 'filled' : ''}`}
            onClick={() => handleStarClick(category, star)}
            onMouseEnter={() => setHoveredStar(prev => ({ ...prev, [category]: star }))}
            onMouseLeave={() => setHoveredStar(prev => ({ ...prev, [category]: 0 }))}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );

  if (!order) return null;

  return (
    <div className="feedback-page">
      <div className="feedback-container">
        <button className="back-button" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>

        <div className="feedback-header">
          <h1>Rate Your Experience</h1>
          <p className="order-info">
            Order from <strong>{order.restaurant?.name || 'Restaurant'}</strong>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="feedback-form">
          <StarRating category="rating" label="Overall Rating *" />
          <StarRating category="foodQuality" label="Food Quality" />
          <StarRating category="deliveryTime" label="Delivery Time" />

          <div className="comment-section">
            <label htmlFor="comment">Additional Comments</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell us more about your experience..."
              maxLength={500}
              rows={5}
            />
            <span className="char-count">{formData.comment.length}/500</span>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={submitting || formData.rating === 0}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Feedback;