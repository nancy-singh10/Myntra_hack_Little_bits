import React from 'react';
import './CategoryCard.css';

const CategoryCard = ({ type, title, subtitle, imageUrl, discount }) => {
  if (type === 'budget') {
    return (
      <div className="category-card budget-card">
        <div className="card-image-placeholder" style={{ backgroundImage: `url(${imageUrl})` }}></div>
        <div className="card-content-overlay">
          <h3 className="budget-title">{title}</h3>
          <p className="budget-subtitle">{subtitle}</p>
        </div>
      </div>
    );
  }

  if (type === 'wow') {
    return (
      <div className="category-card wow-card">
        <div className="card-image-placeholder" style={{ backgroundImage: `url(${imageUrl})` }}></div>
        <div className="wow-content">
          <div className="wow-brands">{subtitle}</div>
          <div className="wow-discount">
            <h3>{title}</h3>
            <p>{discount}</p>
          </div>
        </div>
      </div>
    );
  }

  // default 'shop'
  return (
    <div className="category-card shop-card">
      <div className="card-image-placeholder" style={{ backgroundImage: `url(${imageUrl})` }}></div>
      <div className="shop-content">
        <p className="shop-title">{title}</p>
        <h3 className="shop-discount">{discount}</h3>
        <p className="shop-link">Shop Now</p>
      </div>
    </div>
  );
};

export default CategoryCard;
