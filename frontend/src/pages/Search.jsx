import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { allProducts } from '../data/mockProducts';
import './Search.css';

const Search = ({ wishlist, toggleWishlist }) => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || 'Kurti';
  
  const [filters, setFilters] = useState({
    categories: [],
    brand: [],
    color: [],
    discount: null,
    priceRange: [100, 10100]
  });

  React.useEffect(() => {
    const handleVoiceCommand = (e) => {
      const { action, maxPrice } = e.detail;
      if (action === 'filter-price') {
        setFilters(prev => ({
          ...prev,
          priceRange: [100, maxPrice]
        }));
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, []);

  const handlePriceChange = (index, value) => {
    setFilters(prev => {
      const newRange = [...prev.priceRange];
      newRange[index] = Number(value);
      
      // Ensure min <= max
      if (index === 0 && newRange[0] > newRange[1]) newRange[0] = newRange[1];
      if (index === 1 && newRange[1] < newRange[0]) newRange[1] = newRange[0];

      return { ...prev, priceRange: newRange };
    });
  };

  const handleCheckboxChange = (filterType, value) => {
    setFilters(prev => {
      const currentList = prev[filterType];
      if (currentList.includes(value)) {
        return { ...prev, [filterType]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [filterType]: [...currentList, value] };
      }
    });
  };

  const handleRadioChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const filteredProducts = allProducts.filter(product => {
    // Basic search query matching
    if (query && query.toLowerCase() !== 'all') {
      const q = query.toLowerCase();
      const match = product.title.toLowerCase().includes(q) || 
                    product.category.toLowerCase().includes(q) || 
                    (product.type && product.type.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
    if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) return false;
    if (filters.color.length > 0 && !filters.color.includes(product.color)) return false;
    if (filters.discount !== null) {
      const productDiscount = parseInt(product.discount);
      if (productDiscount < filters.discount) return false;
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      if (product.price < min) return false;
      if (max < 10100 && product.price > max) return false;
    }
    return true;
  });

  return (
    <div className="search-page-container">
      <div className="search-breadcrumbs">
        Home / Clothing / <strong>{query.charAt(0).toUpperCase() + query.slice(1)} For Women</strong>
      </div>
      
      <div className="search-header-row">
        <h3><strong>{query.charAt(0).toUpperCase() + query.slice(1)} For Women</strong> <span className="item-count">- 388259 items</span></h3>
        
        <div className="search-header-actions">
          <div className="header-filters">
            <span>Bundles <span className="arrow-down">˅</span></span>
            <span>Country of Origin <span className="arrow-down">˅</span></span>
            <span>Size <span className="arrow-down">˅</span></span>
          </div>
          <div className="sort-by-dropdown">
            Sort by : <strong>Recommended</strong> <span className="arrow-down">˅</span>
          </div>
        </div>
      </div>

      <div className="search-main-content">
        {/* Left Sidebar Filters */}
        <div className="filters-sidebar">
          <div className="filter-header">
            <h4>FILTERS</h4>
          </div>

          <div className="filter-section">
            <h5 className="filter-title">CATEGORIES</h5>
            <label className="filter-label">
              <input type="checkbox" checked={filters.categories.includes('Kurta Sets')} onChange={() => handleCheckboxChange('categories', 'Kurta Sets')} /> Kurta Sets <span className="filter-count">(255777)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.categories.includes('Kurtas')} onChange={() => handleCheckboxChange('categories', 'Kurtas')} /> Kurtas <span className="filter-count">(132476)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.categories.includes('Sarees')} onChange={() => handleCheckboxChange('categories', 'Sarees')} /> Sarees <span className="filter-count">(89423)</span>
            </label>
          </div>

          <div className="filter-section">
            <div className="filter-title-row">
              <h5 className="filter-title">BRAND</h5>
              <div className="search-icon-circle"><SearchIcon size={12} /></div>
            </div>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('KALINI')} onChange={() => handleCheckboxChange('brand', 'KALINI')} /> KALINI <span className="filter-count">(20530)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('HERE&NOW')} onChange={() => handleCheckboxChange('brand', 'HERE&NOW')} /> HERE&NOW <span className="filter-count">(20248)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('Sangria')} onChange={() => handleCheckboxChange('brand', 'Sangria')} /> Sangria <span className="filter-count">(13739)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('Indo Era')} onChange={() => handleCheckboxChange('brand', 'Indo Era')} /> Indo Era <span className="filter-count">(12352)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('Anouk')} onChange={() => handleCheckboxChange('brand', 'Anouk')} /> Anouk <span className="filter-count">(11899)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('Varanga')} onChange={() => handleCheckboxChange('brand', 'Varanga')} /> Varanga <span className="filter-count">(10953)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('anayna')} onChange={() => handleCheckboxChange('brand', 'anayna')} /> anayna <span className="filter-count">(7853)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('Nayam By Lakshita')} onChange={() => handleCheckboxChange('brand', 'Nayam By Lakshita')} /> Nayam By Lakshita <span className="filter-count">(7487)</span></label>
            <label className="filter-label"><input type="checkbox" checked={filters.brand.includes('Mitera')} onChange={() => handleCheckboxChange('brand', 'Mitera')} /> Mitera <span className="filter-count">(5321)</span></label>
            <div className="more-link">+ 3491 more</div>
          </div>

          <div className="filter-section">
            <h5 className="filter-title">PRICE</h5>
            <div className="price-slider-wrapper">
              <input 
                type="range" 
                min="100" 
                max="10100" 
                step="100"
                value={filters.priceRange[0]} 
                onChange={(e) => handlePriceChange(0, e.target.value)}
                className="price-range-input left-thumb"
                style={{ zIndex: filters.priceRange[0] > 10100 - 100 ? 5 : 3 }}
              />
              <input 
                type="range" 
                min="100" 
                max="10100"
                step="100" 
                value={filters.priceRange[1]} 
                onChange={(e) => handlePriceChange(1, e.target.value)}
                className="price-range-input right-thumb"
              />
              <div className="slider-track">
                <div 
                  className="slider-range" 
                  style={{ 
                    left: `${((filters.priceRange[0] - 100) / 10000) * 100}%`, 
                    right: `${100 - ((filters.priceRange[1] - 100) / 10000) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div className="price-range-text">
              Rs. {filters.priceRange[0]} to Rs. {filters.priceRange[1]}{filters.priceRange[1] === 10100 ? '+' : ''}
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-title-row">
              <h5 className="filter-title">COLOR</h5>
              <div className="search-icon-circle"><SearchIcon size={12} /></div>
            </div>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Pink')} onChange={() => handleCheckboxChange('color', 'Pink')} /> <span className="color-circle" style={{backgroundColor: '#ffc0cb'}}></span> Pink <span className="filter-count">(35865)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Blue')} onChange={() => handleCheckboxChange('color', 'Blue')} /> <span className="color-circle" style={{backgroundColor: '#0000ff'}}></span> Blue <span className="filter-count">(35076)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Multi')} onChange={() => handleCheckboxChange('color', 'Multi')} /> <span className="color-circle" style={{background: 'linear-gradient(45deg, red, blue, green, yellow)'}}></span> Multi <span className="filter-count">(30400)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Black')} onChange={() => handleCheckboxChange('color', 'Black')} /> <span className="color-circle" style={{backgroundColor: '#000000'}}></span> Black <span className="filter-count">(29689)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Green')} onChange={() => handleCheckboxChange('color', 'Green')} /> <span className="color-circle" style={{backgroundColor: '#008000'}}></span> Green <span className="filter-count">(26988)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Purple')} onChange={() => handleCheckboxChange('color', 'Purple')} /> <span className="color-circle" style={{backgroundColor: '#800080'}}></span> Purple <span className="filter-count">(24382)</span>
            </label>
            <label className="filter-label">
              <input type="checkbox" checked={filters.color.includes('Yellow')} onChange={() => handleCheckboxChange('color', 'Yellow')} /> <span className="color-circle" style={{backgroundColor: '#ffff00'}}></span> Yellow <span className="filter-count">(21193)</span>
            </label>
            <div className="more-link">+ 44 more</div>
          </div>

          <div className="filter-section">
            <h5 className="filter-title">DISCOUNT RANGE</h5>
            <label className="filter-label"><input type="radio" name="discount" checked={filters.discount === 10} onChange={() => handleRadioChange('discount', 10)} /> 10% and above</label>
            <label className="filter-label"><input type="radio" name="discount" checked={filters.discount === 20} onChange={() => handleRadioChange('discount', 20)} /> 20% and above</label>
            <label className="filter-label"><input type="radio" name="discount" checked={filters.discount === 30} onChange={() => handleRadioChange('discount', 30)} /> 30% and above</label>
            <label className="filter-label"><input type="radio" name="discount" checked={filters.discount === 40} onChange={() => handleRadioChange('discount', 40)} /> 40% and above</label>
            <label className="filter-label"><input type="radio" name="discount" checked={filters.discount === 50} onChange={() => handleRadioChange('discount', 50)} /> 50% and above</label>
            {filters.discount !== null && (
              <div className="clear-filter" style={{marginTop: '10px', color: '#ff3f6c', fontSize: '12px', cursor: 'pointer', fontWeight: '700'}} onClick={() => handleRadioChange('discount', null)}>
                CLEAR
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="search-results-grid">
          {filteredProducts.map(product => (
            <div className="search-product-card" key={product.id}>
              
                <div className="product-image-wrapper">
                  <Link to={`/product/${product.id}`} style={{textDecoration: 'none', display: 'block', height: '100%'}}>
                    <img src={product.imageUrl} alt={product.title} />
                  </Link>
                  {product.rating && (
                    <div className="product-rating-badge">
                      {product.rating} <span className="star-icon">★</span> | {product.ratingCount}
                    </div>
                  )}
                  <div className="image-carousel-dots">
                    <span className="carousel-dot active"></span>
                    <span className="carousel-dot"></span>
                    <span className="carousel-dot"></span>
                    <span className="carousel-dot"></span>
                    <span className="carousel-dot"></span>
                  </div>
                  <div className="view-similar-icon">
                    <SearchIcon size={14} />
                  </div>
                </div>
                
                <div className="product-details-summary">
                  <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <div className="product-info-default">
                      <h4 className="summary-brand">{product.brand}</h4>
                      <p className="summary-title">{product.title}</p>
                    </div>
                  </Link>
                  
                  <div className="product-info-hover">
                    <button className="wishlist-btn" onClick={(e) => toggleWishlist(e, product.id)}>
                      {wishlist[product.id] ? '❤️ WISHLISTED' : '♡ WISHLIST'}
                    </button>
                    <div className="sizes-text">Sizes: M</div>
                  </div>

                  <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <div className="summary-price-row">
                      <span className="summary-price">Rs. {product.price}</span>
                      <span className="summary-original-price">Rs. {product.originalPrice}</span>
                      <span className="summary-discount">{product.discount}</span>
                    </div>
                    {product.fewLeft && <div className="few-left-text" style={{color: '#ff3f6c', fontSize: '12px', fontWeight: 'bold'}}>Only Few Left!</div>}
                  </Link>
                </div>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
