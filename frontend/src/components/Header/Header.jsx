import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag } from 'lucide-react';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-container">
          <Link to="/">
            <img 
              src="/myntra-logo.png" 
              alt="Myntra" 
              className="myntra-logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
          </Link>
        </div>
        <nav className="nav-links">
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>MEN</Link>
          <Link to="/women" className={`nav-item ${location.pathname === '/women' ? 'active' : ''}`}>WOMEN</Link>
          <Link to="/kids" className={`nav-item ${location.pathname === '/kids' ? 'active' : ''}`}>KIDS</Link>
          <Link to="/home" className={`nav-item ${location.pathname === '/home' ? 'active' : ''}`}>HOME & LIVING</Link>
          <Link to="/beauty" className={`nav-item ${location.pathname === '/beauty' ? 'active' : ''}`}>BEAUTY</Link>
          <Link to="/genz" className={`nav-item ${location.pathname === '/genz' ? 'active' : ''}`}>GENZ</Link>
          <Link to="/studio" className="nav-item studio-link">
            STUDIO <span className="new-badge">NEW</span>
          </Link>

          <Link to="/styling-crew" className={`nav-item ${location.pathname === '/styling-crew' ? 'active' : ''}`} style={{color: '#1976d2', fontWeight: 'bold'}}>
            STYLING CREW <span className="new-badge" style={{background: '#1976d2'}}>AI</span>
          </Link>
          <Link to="/wardrobe" className={`nav-item ${location.pathname === '/wardrobe' ? 'active' : ''}`}>
            WARDROBE
          </Link>
        </nav>
      </div>

      <div className="header-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for products, brands and more" 
            className="search-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (e.target.value) {
                  navigate(`/search?q=${e.target.value}`);
                } else {
                  navigate('/search');
                }
              }
            }}
          />
        </div>
        
        <div className="action-icons">
          <div className="action-item">
            <User size={20} />
            <span>Profile</span>
          </div>
          <Link to="/wishlist" className="action-item" style={{textDecoration: 'none', color: 'inherit'}}>
            <Heart size={20} />
            <span>Wishlist</span>
          </Link>
          <Link to="/cart" className="action-item" style={{textDecoration: 'none', color: 'inherit'}}>
            <ShoppingBag size={20} />
            <span>Bag</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
