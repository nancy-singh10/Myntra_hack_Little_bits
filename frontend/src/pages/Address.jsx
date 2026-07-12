import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Address.css';

const Address = () => {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(1);

  const addresses = [
    {
      id: 1,
      name: 'Jane Doe',
      type: 'HOME',
      street: '123 Fashion Street, Style Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      mobile: '9876543210'
    },
    {
      id: 2,
      name: 'Jane Doe',
      type: 'WORK',
      street: '456 Tech Park, Developer Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      mobile: '9876543210'
    }
  ];

  React.useEffect(() => {
    const handleVoiceCommand = (e) => {
      const { action } = e.detail;
      if (action === 'deliver-here') {
        navigate('/payment');
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, [navigate]);

  return (
    <div className="address-container">
      <div className="address-content">
        <div className="address-left">
          <div className="address-header">
            <h3>Select Delivery Address</h3>
            <button className="add-new-btn">ADD NEW ADDRESS</button>
          </div>
          
          <div className="address-list">
            {addresses.map(addr => (
              <div 
                key={addr.id} 
                className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`}
                onClick={() => setSelectedAddress(addr.id)}
              >
                <div className="address-radio">
                  <input 
                    type="radio" 
                    name="address" 
                    checked={selectedAddress === addr.id}
                    readOnly
                  />
                </div>
                <div className="address-details">
                  <div className="address-name-row">
                    <span className="address-name">{addr.name}</span>
                    <span className="address-type">{addr.type}</span>
                  </div>
                  <div className="address-street">{addr.street}</div>
                  <div className="address-city">{addr.city}, {addr.state} - {addr.pincode}</div>
                  <div className="address-mobile">Mobile: <strong>{addr.mobile}</strong></div>
                  
                  {selectedAddress === addr.id && (
                    <button className="deliver-here-btn" onClick={() => navigate('/payment')}>
                      DELIVER HERE
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-right">
          <div className="price-details-card">
            <h4 className="price-header">PRICE DETAILS (1 Item)</h4>
            
            <div className="price-row">
              <span>Total MRP</span>
              <span>₹2999</span>
            </div>
            <div className="price-row">
              <span>Discount on MRP</span>
              <span className="discount-value">-₹2000</span>
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
              <span>₹999</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
