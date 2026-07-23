import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allProducts } from '../data/mockProducts';

import './ProductDetails.css';

const ProductDetails = ({ addToCart, wishlist, toggleWishlist }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Blue');


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
              addToCart(product, selectedSize, selectedColor, true);
              handleAddToCart();
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

    </div>
  );
};

export default ProductDetails;
