import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allProducts } from '../data/mockProducts';

import './ProductDetails.css';

const ProductDetails = ({ addToCart, wishlist, toggleWishlist, squads, setActiveSquadId }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Blue');
  const [showSquadModal, setShowSquadModal] = useState(false);


  // Find the product from our database or fallback to the first one
  const productData = allProducts.find(p => p.id === parseInt(id)) || allProducts[0];

  // Merge with some default details that might not be in the search card
  const product = {
    ...productData,
    description: productData.description || 'This is a beautiful ethnic set perfect for festive occasions. Made with comfortable fabric and intricate motifs.',
    sizes: productData.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
    colors: productData.colors || ['Blue', 'Pink', 'Green'],
    ratingCount: productData.ratingCount.includes('Ratings') ? productData.ratingCount : `${productData.ratingCount} Ratings`
  };

  const handleAddToCart = () => {
    // In a real app, we'd add to a global Cart context here
    navigate('/cart');
  };

  React.useEffect(() => {
    const handleVoiceCommand = (e) => {
      const { action } = e.detail;
      if (action === 'add-to-bag') {
        addToCart(product, selectedSize, selectedColor);
        handleAddToCart();
      } else if (action === 'add-to-wishlist') {
        toggleWishlist({ preventDefault: () => {}, stopPropagation: () => {} }, product.id);
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, [product, selectedSize, selectedColor, addToCart, toggleWishlist]);

  return (
    <div className="product-details-container">
      <div className="product-breadcrumbs">
        Home / Clothing / Women Clothing / Ethnic Wear / <strong>{product.brand}</strong>
      </div>
      
      <div className="product-main">
        {/* Left: Image */}
        <div className="product-image-section">
          <img src={product.imageUrl} alt={product.title} className="product-main-image" />
        </div>

        {/* Right: Details */}
        <div className="product-info-section">
          <h1 className="product-brand">{product.brand}</h1>
          <h2 className="product-title">{product.title}</h2>
          
          <div className="product-rating">
            <span className="rating-score">{product.rating} ★</span>
            <span className="rating-count">| {product.ratingCount}</span>
          </div>

          <hr className="divider" />

          <div className="product-price-container">
            <span className="current-price">₹{product.price}</span>
            <span className="original-price">MRP ₹{product.originalPrice}</span>
            <span className="discount-text">{product.discount}</span>
          </div>
          <div className="tax-info">inclusive of all taxes</div>

          {/* Color Selector */}
          <div className="color-selector">
            <h3 className="size-heading">COLOR</h3>
            <div className="size-options">
              {product.colors.map(color => (
                <button 
                  key={color} 
                  className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    backgroundColor: color.toLowerCase(), 
                    width: '40px', height: '40px', 
                    borderRadius: '50%', 
                    border: selectedColor === color ? '3px solid #282c3f' : '1px solid #d4d5d9',
                    cursor: 'pointer'
                  }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>

          <div className="size-selector">
            <h3 className="size-heading">SELECT SIZE</h3>
            <div className="size-options">
              {product.sizes.map(size => (
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

          <div className="action-buttons">
            <button className="add-to-bag-btn" onClick={() => {
              addToCart(product, selectedSize, selectedColor, false);
              handleAddToCart();
            }}>
              <span className="icon">🛍️</span> ADD TO BAG
            </button>
            <button className="add-to-bag-btn split-bag-add-btn" onClick={() => {
              if (squads && squads.length > 0) {
                setShowSquadModal(true);
              } else {
                addToCart(product, selectedSize, selectedColor, true);
                handleAddToCart();
              }
            }}>
              <span className="icon">🤝</span> ADD TO SPLIT BAG
            </button>
            <button className="wishlist-btn" onClick={(e) => toggleWishlist(e, product.id)}>
              <span className="icon">{wishlist[product.id] ? '❤️' : '♡'}</span> {wishlist[product.id] ? 'WISHLIST' : 'WISHLIST'}
            </button>
            

          </div>

          <hr className="divider" />
          
          <div className="product-description">
            <h3 className="description-heading">PRODUCT DETAILS</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {showSquadModal && (
        <div className="squad-select-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="squad-select-modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Select Group to add to</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {squads.map(squad => (
                <button 
                  key={squad.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', border: '1px solid #eee', borderRadius: '8px', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => {
                    setActiveSquadId(squad.id);
                    addToCart(product, selectedSize, selectedColor, true);
                    setShowSquadModal(false);
                    alert(`Added to ${squad.name}!`);
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{squad.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#282c3f', fontSize: '16px' }}>{squad.name}</div>
                    <div style={{ color: '#535665', fontSize: '12px' }}>{squad.members.length} members</div>
                  </div>
                </button>
              ))}
            </div>
            <button 
              style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#ff3f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setShowSquadModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;
