import React from 'react';
import './HeroCarousel.css';

const HeroCarousel = () => {
  return (
    <div className="hero-carousel-container">
      {/* First Banner: Flat 300 Off */}
      <div className="banner flat-300-banner">
        <img src="/flat-300-banner.png" alt="Flat 300 Off" className="full-banner-image" />
      </div>

      {/* Main Banner: Mega Savings Sale */}
      <div className="banner mega-savings-banner">
        <img src="/full-banner.png" alt="Mega Savings Sale" className="full-banner-image" />
      </div>
    </div>
  );
};

export default HeroCarousel;
