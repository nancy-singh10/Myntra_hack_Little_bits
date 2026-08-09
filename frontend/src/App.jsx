import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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



import Studio from './pages/Studio';

import './App.css';

function App() {
  const [wishlist, setWishlist] = useState({});
  const [cartItems, setCartItems] = useState([]);
  
  const [squads, setSquads] = useState([
    {
      id: 'squad_1',
      name: "Ananya's Bday Squad",
      icon: '🎂',
      description: 'Shopping for birthday gifts & outfits for Ananya! 🎉',
      members: ['You', 'Neha', 'Priya', 'Rohan'],
      createdAt: 'Yesterday',
      itemCount: 2,
      totalAmount: 1693
    },
    {
      id: 'squad_2',
      name: 'Goa Trip Outfits',
      icon: '🏖️',
      description: 'Beachwear, co-ords & sunglasses for the Goa trip! 🌴',
      members: ['You', 'Amit', 'Sneha'],
      createdAt: '3 days ago',
      itemCount: 3,
      totalAmount: 2450
    },
    {
      id: 'squad_3',
      name: 'Office Diwali Party',
      icon: '✨',
      description: 'Ethnic kurtas & sarees for Diwali celebration at work!',
      members: ['You', 'Karan', 'Meera', 'Vikram', 'Divya'],
      createdAt: '1 week ago',
      itemCount: 4,
      totalAmount: 4200
    }
  ]);
  const [activeSquadId, setActiveSquadId] = useState(null);

  const activeSquad = squads.find(s => s.id === activeSquadId) || squads[0];

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => ({...prev, [id]: !prev[id]}));
  };

  const addToCart = (product, size = 'M', color = 'Default', isShared = false) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.size === size && item.color === color && item.isShared === isShared);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.size === size && item.color === color && item.isShared === isShared
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, size, color, quantity: 1, isShared }];
    });
  };

  return (
    <div className="App">
      <Header />
      
      <Routes>
        <Route path="/" element={<Home squadInfo={activeSquad} addToCart={addToCart} />} />
        <Route path="/women" element={<Women />} />
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/cart" element={
          <Cart
            cartItems={cartItems}
            setCartItems={setCartItems}
            squads={squads}
            setSquads={setSquads}
            activeSquadId={activeSquadId}
            setActiveSquadId={setActiveSquadId}
          />
        } />
        <Route path="/address" element={<Address />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/search" element={<Search wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/wishlist" element={<Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} />} />
        
        {/* Myntra Studio / Vitra Dashboard */}
        <Route path="/studio" element={<Studio addToCart={addToCart} wishlist={wishlist} />} />

        <Route path="*" element={<Home squadInfo={activeSquad} addToCart={addToCart} />} />
      </Routes>

      <VoiceAssistant />
      <Footer />
    </div>
  );
}

export default App;
