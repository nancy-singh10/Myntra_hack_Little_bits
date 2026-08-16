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
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  
  React.useEffect(() => {
    fetch('https://myntra-hack-little-bits.onrender.com/cart/sync/?user_id=mock_user_1')
      .then(res => res.json())
      .then(data => {
        if (data.cart_data) {
          setCartItems(data.cart_data);
        }
        setIsCartLoaded(true);
      })
      .catch(err => {
        console.error("Could not fetch cart", err);
        setIsCartLoaded(true);
      });
  }, []);

  React.useEffect(() => {
    if (!isCartLoaded) return;
    fetch('https://myntra-hack-little-bits.onrender.com/cart/sync/?user_id=mock_user_1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cart_data: cartItems })
    }).catch(err => console.error("Could not sync cart", err));
  }, [cartItems, isCartLoaded]);
  
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
      members: ['You', 'Neha', 'Sonia'],
      createdAt: '1 week ago',
      itemCount: 1,
      totalAmount: 950
    }
  ]);
  const getInitialSquadId = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const joinSquad = params.get('join_squad');
      if (joinSquad) return isNaN(Number(joinSquad)) ? joinSquad : Number(joinSquad);
    }
    return 'squad_1';
  };
  const [activeSquadId, setActiveSquadId] = useState(getInitialSquadId());

  React.useEffect(() => {
    fetch('https://myntra-hack-little-bits.onrender.com/squads/')
      .then(res => res.json())
      .then(data => {
        if(data && data.length > 0) {
            // Merge DB squads with mock squads
            const formattedDbSquads = data.map(s => ({
                id: s.id,
                name: s.name,
                icon: '🛍️',
                description: s.description,
                members: s.members || [],
                createdAt: 'Just now',
                itemCount: 0,
                totalAmount: 0
            }));
            setSquads(prev => [...prev.filter(s => !formattedDbSquads.some(db => db.id === s.id)), ...formattedDbSquads]);
        }
      })
      .catch(err => console.error("Could not fetch squads", err));
  }, []);

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
        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} squads={squads} setActiveSquadId={setActiveSquadId} />} />
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
        <Route path="/studio" element={<Studio addToCart={addToCart} wishlist={wishlist} squads={squads} setActiveSquadId={setActiveSquadId} />} />

        <Route path="*" element={<Home squadInfo={activeSquad} addToCart={addToCart} />} />
      </Routes>

      <VoiceAssistant />
      <Footer />
    </div>
  );
}

export default App;
