import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Address.css';

const Address = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedAddress, setSelectedAddress] = useState(1);
  
  const { displayItems, totalMRP, totalDiscount, totalAmount, checkoutMode, splitBreakdown } = location.state || {
    displayItems: [1],
    totalMRP: 2999,
    totalDiscount: 2000,
    totalAmount: 999,
    checkoutMode: 'pay_all',
    splitBreakdown: {}
  };

  const addresses = [
    {
      id: 1,
      name: 'Nancy',
      type: 'HOME',
      street: 'XYZ STREET',
      city: 'Lucknow',
      state: 'Uttarpradesh',
      pincode: '226001',
      mobile: '9876543210'
    },
    {
      id: 2,
      name: 'Nancy',
      type: 'WORK',
      street: 'XYZ STREET, Tech Park',
      city: 'Lucknow',
      state: 'Uttarpradesh',
      pincode: '226001',
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
                    <button className="deliver-here-btn" onClick={() => navigate('/payment', { state: location.state })}>
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
            <h4 className="price-header">PRICE DETAILS ({displayItems.length} {displayItems.length === 1 ? 'Item' : 'Items'})</h4>
            
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

            {checkoutMode === 'split' && (
              <div className="split-breakdown" style={{marginTop: '15px'}}>
                <h5 style={{fontSize: '12px', color: '#535665', marginBottom: '10px'}}>SPLIT PAYMENT SUMMARY</h5>
                {Object.entries(splitBreakdown).map(([person, amount]) => (
                  <div key={person} className="price-row" style={{marginBottom: '5px'}}>
                    <span style={{fontWeight: 600}}>{person} pays:</span>
                    <span style={{fontWeight: 700}}>₹{amount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
