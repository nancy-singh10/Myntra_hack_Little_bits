import React from 'react';
import SectionHeading from '../components/SectionHeading/SectionHeading';
import CategoryCarousel from '../components/CategoryCarousel/CategoryCarousel';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';

import './Women.css';
import Announcement from '../components/Announcement/Announcement';

const Women = () => {
  // Mock data for Budget Bargains (Women)
  const budgetItems = [
    { title: 'UNDER ₹ 999', subtitle: 'Ethnic Co-ords', imageUrl: 'https://loremflickr.com/400/533/womens,ethnic,wear' },
    { title: 'UNDER ₹ 1299', subtitle: 'Dress Materials', imageUrl: 'https://loremflickr.com/400/533/womens,dress,material' },
    { title: 'UNDER ₹ 999', subtitle: 'Ethnic Heels', imageUrl: 'https://loremflickr.com/400/533/womens,heels' },
    { title: 'UNDER ₹ 999', subtitle: 'Embroidered Flats', imageUrl: 'https://loremflickr.com/400/533/womens,flats' },
  ];

  // Mock data for Wow Worthy Deals (Women)
  const wowItems = [
    { title: 'MIN. 40% OFF', subtitle: 'HOUSE OF XXXX | PinkFort', discount: 'Ethnic Catches', imageUrl: 'https://loremflickr.com/400/533/womens,ethnic' },
    { title: 'UP TO 50% OFF', subtitle: 'FOREVER NEW | BERSHKA', discount: 'Modern Muse', imageUrl: 'https://loremflickr.com/400/533/womens,western' },
    { title: 'MIN. 75% OFF', subtitle: 'ISHIN | VARANGA', discount: 'Timeless Elegance', imageUrl: 'https://loremflickr.com/400/533/womens,kurta' },
    { title: 'MIN. 75% OFF', subtitle: 'anouk | Sangria', discount: 'Ravishing Traditionals', imageUrl: 'https://loremflickr.com/400/533/saree' },
    { title: '30-70% OFF', subtitle: 'DECOR | portico', discount: 'Bedsheets & Curtains', imageUrl: 'https://loremflickr.com/400/533/bedsheets' },
  ];

  // Mock data for Shop By Category (Women section)
  const categoryItems = [
    { title: 'WFH Casual Wear', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,casual,wear' },
    { title: 'Ethnic Wear', discount: '50-70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,ethnic' },
    { title: 'Western Wear', discount: '50-70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,western,dress' },
    { title: 'Innerwear & Sleepwear', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,sleepwear' },
    { title: 'Activewear', discount: '30-70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,gym,wear' },
    { title: 'Beauty & Makeup', discount: 'UP TO 80% OFF', imageUrl: 'https://loremflickr.com/400/533/makeup,beauty' },
    { title: 'Kids Wear', discount: '40-70% OFF', imageUrl: 'https://loremflickr.com/400/533/kids,clothes' },
    { title: 'Footwear', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,shoes' },
    { title: 'Handbags & Bags', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,handbag' },
    { title: 'Watches', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,watch' },
    { title: 'Jewellery', discount: 'UP TO 80% OFF', imageUrl: 'https://loremflickr.com/400/533/jewellery,necklace' },
    { title: 'Home Furnishings', discount: '40-70% OFF', imageUrl: 'https://loremflickr.com/400/533/home,furnishings' },
    { title: 'Headphones & Speakers', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/headphones' },
    { title: 'Size-Inclusive Styles', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/plus,size,fashion' },
    { title: 'Sunglasses', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/sunglasses,womens' },
  ];

  return (
    <>
      <Announcement />
      
      <div className="women-hero-container">
        {/* Flat 300 Off Banner */}
        <div className="flat-discount-banner">
          <div className="flat-discount-left">
            FLAT <sup>₹</sup>300 OFF
          </div>
          <div className="flat-discount-separator"></div>
          <div className="flat-discount-right">
            <div className="purchase-text">
              On Your <span className="purchase-text-bold">1<sup>st</sup> Purchase</span>
            </div>
            <div className="myntra-app-text">
              Via 
              <div className="myntra-app-logo">
                <img src="/myntra-logo.png" alt="Myntra" />
              </div>
              App!
            </div>
          </div>
        </div>
        {/* Mega Savings Banner Image */}
        <div className="mega-savings-banner" style={{ width: '100%', marginTop: '5px' }}>
          {/* Note: Save your image as 'women-hero-banner.png' in the public folder to use it! */}
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200" 
            alt="MEGA SAVINGS SALE" 
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
      
      <main className="main-content">
        {/* Bank Offers Banner for Women */}
        <div className="bank-offers-banner" style={{ justifyContent: 'center', gap: '15px' }}>
          <div className="bank-logos">
            <span className="bank-logo" style={{background: 'linear-gradient(to right, #000, #ff007f)', color: 'white'}}>Axis Bank</span>
            <span className="bank-logo sbi">SBI card</span>
          </div>
          <div className="bank-offer-text">
            <strong>Get 10% Savings*</strong> With Flipkart Axis Bank & SBI Credit Cards
          </div>
        </div>

        <SectionHeading title="BUDGET BARGAINS" />
        <CategoryCarousel items={budgetItems} type="budget" />

        <div className="wow-banner-header">
          <div className="wow-badge">
            <h2 className="wow-title">WOW-WORTHY DEALS</h2>
            <p className="wow-subtitle">Prices That Pack A Punch &gt;</p>
          </div>
        </div>
        <CategoryCarousel items={wowItems} type="wow" />

        <SectionHeading title="SHOP BY CATEGORY" />
        <ShopByCategory items={categoryItems} />

        {/* App Banner Section */}
        <div className="app-banner-container">
          <img src="/app-banner.png" alt="More Knockout Offers Waiting! Only On The Myntra App" className="app-banner-image" />
        </div>
      </main>
    </>
  );
};

export default Women;
