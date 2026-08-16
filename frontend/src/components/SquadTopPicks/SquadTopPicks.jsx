import React from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../SectionHeading/SectionHeading';
import './SquadTopPicks.css';

const squadPicksData = [
  {
    id: 101,
    brand: 'Sangria',
    title: 'Shoulder Strap Kurta Set with Dupatta',
    price: 993,
    originalPrice: 3999,
    discount: '75% OFF',
    rating: '4.5',
    ratingCount: '14.2k',
    imageUrl: '/kurti-2.png',
    badge: '🔥 98% Squad Match',
    reason: 'Liked by Neha, Priya & You'
  },
  {
    id: 102,
    brand: 'anayna',
    title: 'Women Printed Kurta with Trousers',
    price: 1645,
    originalPrice: 5450,
    discount: '70% OFF',
    rating: '4.4',
    ratingCount: '4k',
    imageUrl: '/kurti-3.png',
    badge: '🎉 Top Bday Pick for Ananya',
    reason: 'Swiped Right in Squad Game'
  },
  {
    id: 103,
    brand: 'Tikhi Imli',
    title: 'Ethnic Motifs Embroidered Saree',
    price: 1699,
    originalPrice: 6330,
    discount: '73% OFF',
    rating: '4.6',
    ratingCount: '288',
    imageUrl: '/saree-2.png',
    badge: '✨ Squad Favorite',
    reason: 'Matched with Priya & Rohan'
  },
  {
    id: 104,
    brand: 'Varanga',
    title: 'Women Work Wear Straight Kurta',
    price: 1318,
    originalPrice: 6999,
    discount: '81% OFF',
    rating: '4.2',
    ratingCount: '830',
    imageUrl: '/kurti-1.png',
    badge: '🛍️ Recommended for Ananya',
    reason: 'Matching Ananya Style DNA'
  }
];

const SquadTopPicks = ({ squadInfo, onAddToCart }) => {
  const navigate = useNavigate();
  const squadTitle = squadInfo?.name ? squadInfo.name.toUpperCase() : "ANANYA'S BDAY SQUAD";

  return (
    <section className="squad-top-picks-section">
      <SectionHeading title={`TOP PICKS FOR ${squadTitle}`} />
      
      <div className="squad-picks-subhead">
        <span className="squad-icon-badge">✨ SQUAD CURATED</span>
        <span>Based on your squad's likes, swipe game matches & Ananya's preferences!</span>
      </div>

      <div className="squad-picks-grid">
        {squadPicksData.map(item => (
          <div key={item.id} className="squad-product-card">
            <div className="squad-card-img-wrap">
              <img src={item.imageUrl} alt={item.title} className="squad-product-img" />
              <div className="squad-match-tag">{item.badge}</div>
            </div>

            <div className="squad-product-info">
              <div className="squad-product-brand">{item.brand}</div>
              <div className="squad-product-title">{item.title}</div>
              <div className="squad-reason-text">{item.reason}</div>

              <div className="squad-product-price-row">
                <span className="squad-current-price">₹{item.price}</span>
                <span className="squad-original-price">₹{item.originalPrice}</span>
                <span className="squad-discount-text">{item.discount}</span>
              </div>

              <div className="squad-card-actions">
                <button
                  className="squad-add-btn"
                  onClick={() => {
                    if (onAddToCart) {
                      onAddToCart({
                        id: item.id,
                        brand: item.brand,
                        title: item.title,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        discount: item.discount,
                        imageUrl: item.imageUrl,
                        size: 'M',
                        color: 'Default'
                      }, 'M', 'Default', true);
                    }
                    navigate('/cart');
                  }}
                >
                  🤝 Add to Shared Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SquadTopPicks;
