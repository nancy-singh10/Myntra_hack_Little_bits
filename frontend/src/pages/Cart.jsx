import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cartItems, setCartItems }) => {
  const navigate = useNavigate();

  const totalMRP = cartItems.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalDiscount = cartItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const totalAmount = totalMRP - totalDiscount;

  const handleQuantity = (id, delta) => {
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const handleRemove = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  React.useEffect(() => {
    const handleVoiceCommand = (e) => {
      const { action } = e.detail;
      if (action === 'place-order' && cartItems.length > 0) {
        navigate('/address');
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, [cartItems.length, navigate]);

  return (
    <div className="cart-container">
      <div className="cart-content">
        <div className="cart-left">
          <div className="cart-header">
            <h3>My Bag {cartItems.length > 0 && `(${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`}</h3>
          </div>
          
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.imageUrl} alt={item.title} className="cart-item-image" />
                <div className="cart-item-details">
                  <div className="cart-item-brand">{item.brand}</div>
                  <div className="cart-item-title">{item.title}</div>
                  <div className="cart-item-attributes">
                    <span className="attr-pill">Size: {item.size}</span>
                    <span className="attr-pill">Color: {item.color}</span>
                  </div>
                  <div className="cart-item-price-row">
                    <span className="cart-current-price">₹{item.price}</span>
                    <span className="cart-original-price">₹{item.originalPrice}</span>
                    <span className="cart-discount">{item.discount}</span>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button onClick={() => handleQuantity(item.id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQuantity(item.id, 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => handleRemove(item.id)}>Remove</button>
                </div>
              </div>
            ))}
            {cartItems.length === 0 && (
              <div className="empty-cart">
                <p>Your cart is empty!</p>
                <button onClick={() => navigate('/women')} className="continue-shopping">CONTINUE SHOPPING</button>
              </div>
            )}
          </div>
        </div>

        <div className="cart-right">
          <div className="price-details-card">
            <h4 className="price-header">PRICE DETAILS ({cartItems.length} Items)</h4>
            
            <div className="price-row">
              <span>Total MRP</span>
              <span>₹{totalMRP}</span>
            </div>
            <div className="price-row">
              <span>Discount on MRP</span>
              <span className="discount-value">-₹{totalDiscount}</span>
            </div>
            <div className="price-row">
              <span>Platform Fee</span>
              <span>FREE</span>
            </div>
            <div className="price-row">
              <span>Shipping Fee</span>
              <span className="discount-value">FREE</span>
            </div>
            
            <hr className="price-divider" />
            
            <div className="price-row total-row">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>
            
            <button 
              className="place-order-btn" 
              onClick={() => navigate('/address')}
              disabled={cartItems.length === 0}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
