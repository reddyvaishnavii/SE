import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../utils/api';

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { cartItems, restaurant, clearCart, calculateTotal } = useCart();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Pre-fill address if user has one
    if (user?.address) {
      setDeliveryAddress(user.address);
    }
  }, [isLoggedIn, cartItems, user, navigate]);

  const handleCardChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === 'cardNumber') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      value = value.slice(0, 19); // Max 16 digits + 3 spaces
    } else if (e.target.name === 'expiryDate') {
      // Format MM/YY
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    } else if (e.target.name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setCardDetails({ ...cardDetails, [e.target.name]: value });
  };

  const handleAddressChange = (e) => {
    setDeliveryAddress({
      ...deliveryAddress,
      [e.target.name]: e.target.value,
    });
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const cardNum = cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNum.length !== 16) {
        setError('Card number must be 16 digits');
        return false;
      }
      if (!cardDetails.cardName) {
        setError('Cardholder name is required');
        return false;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        setError('Expiry date must be in MM/YY format');
        return false;
      }
      if (cardDetails.cvv.length !== 3) {
        setError('CVV must be 3 digits');
        return false;
      }
    }

    // Validate address
    if (!deliveryAddress.street || !deliveryAddress.city || 
        !deliveryAddress.state || !deliveryAddress.zipCode) {
      setError('Please fill in all address fields');
      return false;
    }

    return true;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePayment()) {
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order after successful payment
      const orderData = {
        user: user.id,
        restaurant: restaurant.id,
        items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          menuItem: item.id
        })),
        totalAmount: calculateTotal(),
        deliveryAddress: deliveryAddress,
        status: 'pending',
        paymentStatus: 'completed'
      };

      console.log('Creating order after payment:', orderData);
      const order = await orderAPI.create(orderData);
      console.log('Order created:', order);

      // Clear cart
      clearCart();

      // Show success message
      alert('Payment successful! Your order has been placed. 🎉');

      // Redirect to orders page
      navigate('/orders');
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect
  }

  const total = calculateTotal();

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button onClick={() => navigate('/cart')} className="back-button">
            ← Back to Cart
          </button>
          <h1>Checkout & Payment</h1>
        </div>

        <div className="payment-content">
          {/* Left side - Forms */}
          <div className="payment-forms">
            {error && (
              <div className="error-message">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* Delivery Address */}
            <div className="form-section">
              <h3>📍 Delivery Address</h3>
              <form className="address-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address *"
                    value={deliveryAddress.street}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    name="city"
                    placeholder="City *"
                    value={deliveryAddress.city}
                    onChange={handleAddressChange}
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State *"
                    value={deliveryAddress.state}
                    onChange={handleAddressChange}
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code *"
                    value={deliveryAddress.zipCode}
                    onChange={handleAddressChange}
                    required
                  />
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-methods">
                <button
                  className={`payment-method-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  💳 Credit/Debit Card
                </button>
                <button
                  className={`payment-method-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  📱 UPI
                </button>
                <button
                  className={`payment-method-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  💵 Cash on Delivery
                </button>
              </div>

              {paymentMethod === 'card' && (
                <form className="card-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={cardDetails.cardName}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        name="expiryDate"
                        placeholder="MM/YY"
                        value={cardDetails.expiryDate}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                  </div>
                </form>
              )}

              {paymentMethod === 'upi' && (
                <div className="upi-form">
                  <input
                    type="text"
                    placeholder="Enter UPI ID (e.g., name@upi)"
                    className="upi-input"
                  />
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="cod-info">
                  <p>💵 Pay with cash when your order arrives</p>
                  <p className="cod-note">Please keep exact change handy</p>
                </div>
              )}
            </div>

            <button
              className="pay-button"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing Payment...
                </>
              ) : (
                `Pay $${total.toFixed(2)}`
              )}
            </button>
          </div>

          {/* Right side - Order Summary */}
          <div className="order-summary-sidebar">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              {restaurant && (
                <div className="restaurant-info">
                  <strong>{restaurant.name}</strong>
                </div>
              )}

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item">
                    <span className="item-name">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${(total - 3.99 - (total - 3.99) * 0.08).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (8%):</span>
                  <span>${((total - 3.99) * 0.08).toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee:</span>
                  <span>$3.99</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total">
                  <strong>Total:</strong>
                  <strong>${total.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="secure-payment">
              <span>🔒</span>
              <p>Your payment information is secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;