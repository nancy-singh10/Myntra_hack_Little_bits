import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-main">
        <div className="footer-column">
          <h4 className="footer-heading">ONLINE SHOPPING</h4>
          <ul className="footer-links">
            <li><a href="#">Men</a></li>
            <li><a href="#">Women</a></li>
            <li><a href="#">Kids</a></li>
            <li><a href="#">Home</a></li>
            <li><a href="#">Beauty</a></li>
            <li><a href="#">Genz</a></li>
            <li><a href="#">Gift Cards</a></li>
            <li><a href="#">Myntra Insider</a></li>
          </ul>

          <h4 className="footer-heading" style={{ marginTop: '25px' }}>USEFUL LINKS</h4>
          <ul className="footer-links">
            <li><a href="#">Blog</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Site Map</a></li>
            <li><a href="#">Corporate Information</a></li>
            <li><a href="#">Whitehat</a></li>
            <li><a href="#">Cleartrip</a></li>
            <li><a href="#">Myntra Global</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">CUSTOMER POLICIES</h4>
          <ul className="footer-links">
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">T&amp;C</a></li>
            <li><a href="#">Terms Of Use</a></li>
            <li><a href="#">Track Orders</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Cancellation</a></li>
            <li><a href="#">Privacy policy</a></li>
            <li><a href="#">Grievance Redressal</a></li>
            <li><a href="#">FSSAI Food Safety</a></li>
            <li><a href="#">Connect app</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">EXPERIENCE MYNTRA APP ON MOBILE</h4>
          <div className="app-download-buttons">
            <a href="#" className="store-btn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" />
            </a>
            <a href="#" className="store-btn">
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" />
            </a>
          </div>

          <h4 className="footer-heading" style={{ marginTop: '30px' }}>KEEP IN TOUCH</h4>
          <div className="social-icons">
            <a href="#" className="social-icon"><span>f</span></a>
            <a href="#" className="social-icon"><span>t</span></a>
            <a href="#" className="social-icon"><span>y</span></a>
            <a href="#" className="social-icon"><span>i</span></a>
          </div>
        </div>

        <div className="footer-column guarantees">
          <div className="guarantee-item">
            <div className="guarantee-icon-container">
              <img src="/original-icon.png" alt="100% Original" className="guarantee-icon" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="icon-fallback">100%</div>
            </div>
            <div className="guarantee-text">
              <strong>100% ORIGINAL</strong> guarantee for all products at myntra.com
            </div>
          </div>
          <div className="guarantee-item">
            <div className="guarantee-icon-container">
              <img src="/return-icon.png" alt="Return within 14 days" className="guarantee-icon" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="icon-fallback">14</div>
            </div>
            <div className="guarantee-text">
              <strong>Return within 14days</strong> of receiving your order
            </div>
          </div>
        </div>
      </div>

      <div className="footer-popular-searches">
        <h4 className="footer-heading">POPULAR SEARCHES</h4>
        <p className="search-links">
          Makeup | Dresses For Girls | T-Shirts | Sandals | Headphones | Babydolls | Blazers For Men | Handbags | Ladies Watches | Bags | Sport Shoes | Reebok Shoes | Puma Shoes | Boxers | Wallets | Tops | Earrings | Fastrack Watches | Kurtis | Nike | Smart Watches | Titan Watches | Designer Blouse | Gowns | Rings | Cricket Shoes | Forever 21 | Eye Makeup | Photo Frames | Punjabi Suits | Bikini | Myntra Fashion Show | Lipstick | Saree | Watches | Dresses | Lehenga | Nike Shoes | Goggles | Bras | Suit | Chinos | Shoes | Adidas Shoes | Woodland Shoes | Jewellery | Designers Sarees
        </p>
      </div>
    </footer>
  );
};

export default Footer;
