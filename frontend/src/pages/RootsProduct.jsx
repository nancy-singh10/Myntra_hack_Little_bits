import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Star, Users, MapPin, CheckCircle } from 'lucide-react';
import './RootsProduct.css';

const RootsProduct = () => {
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('M');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleWhatsAppShare = () => {
    const message = "Hey! I found this Authentic Banarasi Silk Saree on Bharat Loom for just ₹1,999! If 2 more people join my drop, we all get it at this price! Check it out: http://localhost:5173/roots/product/roots_1";
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
    
    // Mock the unlock for the demo after they click share
    setTimeout(() => {
      setIsUnlocked(true);
    }, 1500);
  };
  
  return (
    <div className="roots-product-container">
      <div className="product-image-container">
        <img src="/saree-ban.jpeg" alt="Banarasi Silk" className="main-image" />
        <div className="artisan-badge">
          <MapPin size={12} />
          <span>Handwoven in Varanasi</span>
        </div>
      </div>

      <div className="product-details">
        <div className="brand-section">
          <h2>Rahul Weavers</h2>
          <h1>Authentic Banarasi Silk Saree</h1>
          <div className="rating">
            <span className="stars">4.9 <Star size={12} fill="#14958f" color="#14958f"/></span>
            <span className="reviews-count">124 local reviews</span>
          </div>
        </div>

        <div className="pricing-section">
          <h3>Choose your buying option:</h3>
          
          <div className="price-card standard">
            <div className="price-left">
              <span className="price">₹3,499</span>
              <span className="label">Buy Solo</span>
            </div>
            <button className="select-btn" onClick={() => navigate('/roots/checkout')} disabled={isUnlocked}>
              Buy Now
            </button>
          </div>

          <div className={`price-card community-drop ${isUnlocked ? 'unlocked' : ''}`}>
            <div className="drop-badge">{isUnlocked ? 'DROP UNLOCKED 🎉' : 'HOT DROP'}</div>
            <div className="price-left">
              <span className="price">₹1,999 <span className="discount">42% OFF</span></span>
              <span className="label">
                {isUnlocked ? 'Goal Met! (3/3 Buyers Joined)' : 'Community Drop (Need 3 Buyers)'}
              </span>
            </div>
            {isUnlocked ? (
              <button className="select-btn unlocked-btn" onClick={() => navigate('/roots/checkout')}>
                Buy Drop Now
              </button>
            ) : (
              <button className="share-btn" onClick={handleWhatsAppShare}>
                <Share2 size={16} /> Share on WhatsApp
              </button>
            )}
          </div>
        </div>

        <div className="size-selector">
          <h3>Select Size</h3>
          <div className="sizes">
            {['S', 'M', 'L', 'XL'].map(size => (
              <button 
                key={size} 
                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="trust-section">
          <h3>Real-Size Reviews near you</h3>
          <div className="location-filter">
            <MapPin size={14} color="#ff3f6c" />
            <span>Showing reviews from <strong>Lucknow & Kanpur</strong></span>
          </div>
          
          <div className="review-cards">
            <div className="review-card">
              <img src="/saree-ban.jpeg" alt="Review" className="review-img"/>
              <div className="review-text">
                <p>"Fits perfectly! The silk is so authentic and pure."</p>
                <span>- Priya, 5'4" (Size M)</span>
                <div className="verified"><CheckCircle size={12}/> Verified Purchase</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RootsProduct;
