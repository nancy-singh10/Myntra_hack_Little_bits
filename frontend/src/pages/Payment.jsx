import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  const { displayItems, totalMRP, totalDiscount, totalAmount, checkoutMode, splitBreakdown } = location.state || {
    displayItems: [1],
    totalMRP: 2999,
    totalDiscount: 2000,
    totalAmount: 999,
    checkoutMode: 'pay_all',
    splitBreakdown: {}
  };

  const paymentMethods = [
    { id: 'UPI', label: 'UPI', description: 'Pay via any UPI app' },
    { id: 'CARD', label: 'Credit / Debit Card', description: 'Visa, Mastercard, RuPay' },
    { id: 'COD', label: 'Cash On Delivery (Cash/UPI)', description: 'Pay at your doorstep' }
  ];

  const handlePlaceOrder = () => {
    alert('Order placed successfully! Redirecting to Home...');
    navigate('/');
  };

  return (
    <div className="payment-container">
      <div className="address-content">
        <div className="address-left">
          <div className="address-header">
            <h3>Choose Payment Mode</h3>
          </div>
          
          <div className="payment-options-container">
            <div className="payment-sidebar">
              {paymentMethods.map(method => (
                <div 
                  key={method.id} 
                  className={`payment-tab ${selectedMethod === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  {method.label}
                </div>
              ))}
            </div>
            
            <div className="payment-details">
              <h4 className="payment-method-title">{paymentMethods.find(m => m.id === selectedMethod)?.label}</h4>
              <p className="payment-method-desc">{paymentMethods.find(m => m.id === selectedMethod)?.description}</p>
              
              {selectedMethod === 'UPI' && (
                <div className="upi-form">
                  <input type="text" placeholder="Enter UPI ID here" className="payment-input" />
                  <button className="verify-btn">Verify</button>
                </div>
              )}
              
              {selectedMethod === 'CARD' && (
                <div className="card-form">
                  <input type="text" placeholder="Card Number" className="payment-input full-width" />
                  <div className="card-row">
                    <input type="text" placeholder="Valid Thru (MM/YY)" className="payment-input half-width" />
                    <input type="password" placeholder="CVV" className="payment-input half-width" />
                  </div>
                </div>
              )}
              
              {selectedMethod === 'COD' && (
                <div className="cod-form">
                  <p className="cod-fee-msg">You can pay via Cash or UPI at the time of delivery.</p>
                </div>
              )}
              
              <button className="pay-now-btn" onClick={handlePlaceOrder}>
                {selectedMethod === 'COD' ? 'PLACE ORDER' : `PAY ₹${totalAmount}`}
              </button>
            </div>
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

export default Payment;
