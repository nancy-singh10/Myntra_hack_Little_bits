import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { allProducts } from '../data/mockProducts';
import './Wishlist.css';

const Wishlist = ({ wishlist, toggleWishlist, addToCart }) => {
  // Filter products to only those that are wishlisted (where wishlist[id] is true)
  const wishlistedProducts = allProducts.filter(p => wishlist[p.id]);
  const navigate = useNavigate();

  return (
    <div className="wishlist-page-container">
      <div className="wishlist-header">
        <h2>My Wishlist <span className="wishlist-count">{wishlistedProducts.length} items</span></h2>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="empty-wishlist">
          <div className="empty-wishlist-text">Your wishlist is empty</div>
          <p>Add items that you like to your wishlist. Review them anytime and easily move them to the bag.</p>
          <Link to="/search">
            <button className="continue-shopping-btn">CONTINUE SHOPPING</button>
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistedProducts.map(product => (
            <div className="wishlist-product-card" key={product.id}>
              <div className="product-image-wrapper">
                <div style={{cursor: 'pointer', display: 'block', height: '100%'}} onClick={() => {
                    // Dispatch event to load this image into the Studio mirror and navigate there
                    window.dispatchEvent(new CustomEvent('load-model-image', { detail: { imageUrl: product.imageUrl } }));
                    navigate('/studio');
                  }}>
                  <img src={product.imageUrl} alt={product.title} />
                </div>
                <div 
                  className="remove-wishlist-btn" 
                  onClick={(e) => toggleWishlist(e, product.id)}
                >
                  X
                </div>
              </div>
              <div className="wishlist-details-summary">
                <p className="summary-title">{product.title}</p>
                <div className="summary-price-row">
                  <span className="summary-price">Rs. {product.price}</span>
                  <span className="summary-original-price">Rs. {product.originalPrice}</span>
                  <span className="summary-discount">({product.discount})</span>
                </div>
                <button 
                  className="move-to-bag-btn" 
                  onClick={(e) => {
                    addToCart(product, 'M', 'Default');
                    toggleWishlist(e, product.id); // removes from wishlist
                  }}
                >
                  MOVE TO BAG
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
