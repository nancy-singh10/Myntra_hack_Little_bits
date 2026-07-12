import React from 'react';
import { Link } from 'react-router-dom';
import './ShopByCategory.css';
import CategoryCard from '../CategoryCard/CategoryCard';

const ShopByCategory = ({ items }) => {
  return (
    <div className="shop-by-category-container">
      <div className="category-grid">
        {items.map((item, index) => (
          <div className="grid-item" key={index}>
            <Link to={`/product/${index + 100}`} style={{textDecoration: 'none'}}>
              <CategoryCard 
                type="shop"
                title={item.title}
                discount={item.discount}
                imageUrl={item.imageUrl}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByCategory;
