import React, { useState } from 'react';
import { MapPin, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import './RootsCheckout.css';

const RootsCheckout = () => {
  const [deliveryMethod, setDeliveryMethod] = useState('nukkad');

  return (
    <div className="roots-checkout-container">
      <h2>Select Delivery Method</h2>

      <div 
        className={`delivery-option ${deliveryMethod === 'nukkad' ? 'selected' : ''}`}
        onClick={() => setDeliveryMethod('nukkad')}
      >
        <div className="option-header">
          <div className="radio-circle">{deliveryMethod === 'nukkad' && <div className="inner-circle" />}</div>
          <div className="option-title">
            <h3>Nukkad Hub (Free & Instant)</h3>
            <span className="recommended-badge">Recommended</span>
          </div>
        </div>
        
        <div className="nukkad-details">
          <div className="map-placeholder">
            <MapPin size={24} color="#ff3f6c" />
          </div>
          <div className="hub-info">
            <h4>Anjali's Boutique</h4>
            <p>12, Main Market Road (300m away)</p>
            <ul className="perks-list">
              <li><CheckCircle size={14} color="#14958f"/> Pick up today by 6 PM</li>
              <li><CheckCircle size={14} color="#14958f"/> Pay cash on pickup</li>
              <li><CheckCircle size={14} color="#14958f"/> Instant physical returns if it doesn't fit</li>
            </ul>
          </div>
        </div>
      </div>

      <div 
        className={`delivery-option ${deliveryMethod === 'home' ? 'selected' : ''}`}
        onClick={() => setDeliveryMethod('home')}
      >
        <div className="option-header">
          <div className="radio-circle">{deliveryMethod === 'home' && <div className="inner-circle" />}</div>
          <div className="option-title">
            <h3>Standard Home Delivery</h3>
          </div>
        </div>
        
        <div className="home-details">
          <Truck size={20} color="#666" />
          <div className="hub-info">
            <p>Delivered in 5-7 days</p>
            <p className="shipping-fee">Shipping Fee: ₹150 (Artisan Direct)</p>
          </div>
        </div>
      </div>

      <div className="price-summary-card">
        <h3>Price Details</h3>
        <div className="price-row">
          <span>Authentic Banarasi Silk Saree</span>
          <span>₹3,499</span>
        </div>
        <div className="price-row discount-row">
          <span>Community Drop Discount</span>
          <span>-₹1,500</span>
        </div>
        <div className="price-row">
          <span>Delivery Fee</span>
          <span>{deliveryMethod === 'nukkad' ? 'FREE' : '₹150'}</span>
        </div>
        <hr />
        <div className="price-row total-row">
          <span>Total Amount</span>
          <span>{deliveryMethod === 'nukkad' ? '₹1,999' : '₹2,149'}</span>
        </div>
      </div>

      <div className="trust-banner">
        <ShieldCheck size={20} color="#14958f" />
        <span>100% Authentic Handloom Guarantee</span>
      </div>

      <button className="place-order-btn">
        PLACE ORDER
      </button>
    </div>
  );
};

export default RootsCheckout;
