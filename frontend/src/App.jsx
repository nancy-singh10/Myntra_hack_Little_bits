import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';
import Home from './pages/Home';
import Women from './pages/Women';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Address from './pages/Address';
import Payment from './pages/Payment';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';
import './App.css';

function App() {
  const [wishlist, setWishlist] = useState({});
  const [cartItems, setCartItems] = useState([]);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => ({...prev, [id]: !prev[id]}));
  };

  const addToCart = (product, size = 'M', color = 'Default') => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, size, color, quantity: 1 }];
    });
  };

  return (
    <div className="App">
      <Header />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/women" element={<Women />} />
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/cart" element={<Cart cartItems={cartItems} setCartItems={setCartItems} />} />
        <Route path="/address" element={<Address />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/search" element={<Search wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/wishlist" element={<Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
        <Route path="*" element={<Home />} />
      </Routes>

      <VoiceAssistant />
      <Footer />
    </div>
  );
}

export default App;
