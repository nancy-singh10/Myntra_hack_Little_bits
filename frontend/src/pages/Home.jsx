import React from 'react';
import Announcement from '../components/Announcement/Announcement';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import SectionHeading from '../components/SectionHeading/SectionHeading';
import CategoryCarousel from '../components/CategoryCarousel/CategoryCarousel';
import ShopByCategory from '../components/ShopByCategory/ShopByCategory';
import SquadTopPicks from '../components/SquadTopPicks/SquadTopPicks';

const Home = ({ squadInfo, addToCart }) => {
  // Mock data for Budget Bargains
  const budgetItems = [
    { title: 'UNDER ₹ 1599', subtitle: 'Regal Lehengas', imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400' },
    { title: 'UNDER ₹ 999', subtitle: 'Ethnic Co-ords', imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400' },
    { title: 'UNDER ₹ 1299', subtitle: 'Dress Materials', imageUrl: 'https://images.unsplash.com/photo-1564585222527-c2777a5bc6cb?auto=format&fit=crop&q=80&w=400' },
    { title: 'UNDER ₹ 999', subtitle: 'Ethnic Heels', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=400' },
    { title: 'UNDER ₹ 999', subtitle: 'Embroidered Flats', imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400' },
  ];

  // Mock data for Wow Worthy Deals
  const wowItems = [
    { title: 'MIN. 50% OFF', subtitle: 'TOMMY HILFIGER | Calvin Klein', discount: 'Effortless Styles', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400' },
    { title: 'MIN. 55% OFF', subtitle: 'FRENCH CONNECTION | AEROPOSTALE', discount: 'Casual-Day Picks', imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=400' },
    { title: 'MIN. 50% OFF', subtitle: 'U.S. POLO ASSN. | NEEMAN\'S', discount: 'Daily Comfort', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400' },
    { title: 'UPTO 40% OFF', subtitle: 'BIRKENSTOCK | LACOSTE', discount: 'Premium Comfort', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400' },
  ];

  // Mock data for Shop By Category (Expanded for the layout)
  const categoryItems = [
    { title: 'Ethnic Wear', discount: '50-80% OFF', imageUrl: 'https://loremflickr.com/400/533/saree,indian' },
    { title: 'Casual Wear', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,casual,clothes' },
    { title: 'Men\'s Activewear', discount: '30-70% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,gym,activewear' },
    { title: 'Women\'s Activewear', discount: '30-70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,gym,activewear' },
    { title: 'Western Wear', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,western,dress' },
    { title: 'Sportswear', discount: '30-80% OFF', imageUrl: 'https://loremflickr.com/400/533/sportswear,running' },
    { title: 'Loungewear', discount: '30-60% OFF', imageUrl: 'https://loremflickr.com/400/533/loungewear,pajamas' },
    { title: 'Innerwear', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,underwear' },
    { title: 'Lingerie', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/lingerie' },
    { title: 'Watches', discount: 'UP TO 80% OFF', imageUrl: 'https://loremflickr.com/400/533/luxury,watch' },
    { title: 'Grooming', discount: 'UP TO 60% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,grooming,shaving' },
    { title: 'Beauty & Makeup', discount: 'UP TO 60% OFF', imageUrl: 'https://loremflickr.com/400/533/makeup,beauty' },
    { title: 'Kids Wear', discount: '50-70% OFF', imageUrl: 'https://loremflickr.com/400/533/kids,clothing' },
    { title: 'Men\'s Footwear', discount: '50-70% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,sneakers' },
    { title: 'Women\'s Footwear', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,heels' },
    { title: 'Bags, Belts & Wallets', discount: '40-70% OFF', imageUrl: 'https://loremflickr.com/400/533/leather,belt,wallet' },
    { title: 'Office Wear', discount: '40-70% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,office,suit' },
    { title: 'Men\'s Ethnic Wear', discount: 'UP TO 60% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,indian,kurta' },
    { title: 'Home Decor', discount: '40-70% OFF', imageUrl: 'https://loremflickr.com/400/533/home,decor,living,room' },
    { title: 'Handbags', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,handbag' },
    { title: 'Headphones & Speakers', discount: 'UP TO 70% OFF', imageUrl: 'https://loremflickr.com/400/533/headphones' },
    { title: 'Jewellery', discount: 'UP TO 80% OFF', imageUrl: 'https://loremflickr.com/400/533/jewellery,necklace' },
    { title: 'Size-Inclusive Styles', discount: 'UP TO 60% OFF', imageUrl: 'https://loremflickr.com/400/533/plus,size,fashion' },
    { title: 'Inclusive Styles', discount: 'UP TO 60% OFF', imageUrl: 'https://loremflickr.com/400/533/diverse,fashion' },
    { title: 'Watches & Wearables', discount: 'UP TO 80% OFF', imageUrl: 'https://loremflickr.com/400/533/smartwatch' },
    { title: 'Sleepwear', discount: '30-70% OFF', imageUrl: 'https://loremflickr.com/400/533/sleepwear,pajamas' },
    { title: 'Workwear', discount: '40-70% OFF', imageUrl: 'https://loremflickr.com/400/533/womens,office,wear' },
    { title: 'Eyewear', discount: 'UP TO 80% OFF', imageUrl: 'https://loremflickr.com/400/533/sunglasses,eyewear' },
    { title: 'Workwear', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/mens,office,wear' },
    { title: 'Casual Styles', discount: '40-80% OFF', imageUrl: 'https://loremflickr.com/400/533/casual,fashion' },
    { title: 'Bags & Backpacks', discount: '30-80% OFF', imageUrl: 'https://loremflickr.com/400/533/backpack,bag' },
    { title: 'Trolleys & Luggage Bags', discount: '30-70% OFF', imageUrl: 'https://loremflickr.com/400/533/luggage,suitcase' },
    { title: 'Flip-Flops', discount: '30-70% OFF', imageUrl: 'https://loremflickr.com/400/533/flip,flops,sandals' },
  ];

  return (
    <>
      <Announcement />
      <HeroCarousel />
      
      <main className="main-content">
        {/* Bank Offers Banner */}
        <div className="bank-offers-banner">
          <div className="bank-logos">
            <span className="bank-logo bob">BOBCARD</span>
            <span className="bank-logo hsbc">HSBC</span>
            <span className="bank-logo sbi">SBI card</span>
          </div>
          <div className="bank-offer-text">
            10% Instant Discount*
          </div>
        </div>

        {/* Dedicated Squad Top Picks Section */}
        <SquadTopPicks squadInfo={squadInfo} onAddToCart={addToCart} />

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
          {/* User will place app-banner.png in public folder */}
          <img src="/app-banner.png" alt="More Knockout Offers Waiting! Only On The Myntra App" className="app-banner-image" />
        </div>
      </main>
    </>
  );
};

export default Home;
