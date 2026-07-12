import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCarousel.css';
import CategoryCard from '../CategoryCard/CategoryCard';

const CategoryCarousel = ({ items, type }) => {
  return (
    <div className="category-carousel">
      <div className="carousel-track">
        {items.map((item, index) => (
          <div className="carousel-slide" key={index}>
            <Link to={`/product/${index + 1}`} style={{textDecoration: 'none'}}>
              <CategoryCard 
                type={type}
                title={item.title}
                subtitle={item.subtitle}
                discount={item.discount}
                imageUrl={item.imageUrl}
              />
            </Link>
          </div>
        ))}
      </div>
      
      {/* Simple indicators */}
      <div className="carousel-indicators">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`indicator ${i === 1 ? 'active' : ''}`}></span>
        ))}
      </div>
    </div>
  );
};

export default CategoryCarousel;
