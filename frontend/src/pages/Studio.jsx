import React, { useState, useRef, useEffect } from 'react';
import './Studio.css';
import { generateVirtualTryOn } from '../services/gradioVtonService';
import { generate3DModel } from '../services/gradio3DService';
import { allProducts } from '../data/mockProducts';

// Mock Data (fallback)
const wardrobeItems = [
  { id: 1, name: "Crochet Lace Top", brand: "Urbanic", category: "Tops", status: "loved", usage: 34, image: "/custom-top.png", price: 560 },
  { id: 11, name: "Orange Tie-Front Top", brand: "Boutique", category: "Tops", status: "loved", usage: 10, image: "/orange_tie_top.png", price: 899 },
  { id: 2, name: "Baggy Jeans", brand: "Tokyo Talkies", category: "Bottoms", status: "rotation", usage: 12, image: "/custom-jeans.png", price: 1500 },
  { id: 3, name: "Fastrack Shades", brand: "Fastrack", category: "Accessories", status: "rotation", usage: 42, image: "/custom-sunglasses.png", price: 750 },
  { id: 4, name: "Cult Chunky Sneaker", brand: "Cult", category: "Shoes", status: "loved", usage: 18, image: "/custom-shoe.png", price: 4000 },
  { id: 5, name: "Tapered Trouser", brand: "COS", category: "Bottoms", status: "loved", usage: 14, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400&auto=format&fit=crop", price: 2899 },
  { id: 6, name: "Penny Loafer", brand: "GH Bass", category: "Shoes", status: "loved", usage: 22, image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=400&auto=format&fit=crop", price: 6500 },
  // PERFECT DEMO ITEMS BELOW (Flat lays that work perfectly with IDM-VTON)
  { id: 7, name: "Classic White Tee", brand: "Uniqlo", category: "Tops", status: "rotation", usage: 45, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop", price: 999 },
  { id: 8, name: "Red Flannel", brand: "Levi's", category: "Tops", status: "dormant", usage: 2, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop", price: 2499 },
  { id: 9, name: "Summer Skirt", brand: "Zara", category: "Bottoms", status: "loved", usage: 18, image: "https://images.unsplash.com/photo-1582142306909-195724d33ffc?q=80&w=400&auto=format&fit=crop", price: 1599 },
  { id: 10, name: "Denim Jacket", brand: "Wrangler", category: "Outerwear", status: "loved", usage: 28, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop", price: 3299 },
];

const initialChatMessages = [
  { type: 'system-intro' },
  { type: 'demand-signal' },
  { type: 'proposal' },
  { type: 'alert' }
];

const Studio = ({ addToCart, wishlist, squads, setActiveSquadId }) => {
  const wishlistItems = (wishlist && Object.keys(wishlist).some(k => wishlist[k])) 
    ? allProducts.filter(p => wishlist[p.id]).map(item => ({
        id: `w_${item.id}`,
        name: item.title,
        brand: item.brand,
        category: item.category,
        status: "loved",
        usage: Math.floor(Math.random() * 20) + 1,
        image: item.imageUrl,
        price: item.price
      }))
    : [];

  const displayItems = [...wardrobeItems, ...wishlistItems];

  const availableCategories = ["All", ...new Set(displayItems.map(i => i.category))];

  const [activeFilter, setActiveFilter] = useState("All");
  const [activePoseIndex, setActivePoseIndex] = useState(0);
  const [wornItems, setWornItems] = useState([]);
  
  const [selectedLocalPose, setSelectedLocalPose] = useState(null);
  const [isGeneratingVton, setIsGeneratingVton] = useState(false);
  const [vtonResultImage, setVtonResultImage] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [getupToShare, setGetupToShare] = useState(null);
  const fileInputRef = useRef(null);

  const [showPoseSelector, setShowPoseSelector] = useState(false);
  const [tempUploadedPhoto, setTempUploadedPhoto] = useState(null);
  
  const [is3DMode, setIs3DMode] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  
  // Load saved pose from localStorage on mount
  useEffect(() => {
    const savedPose = localStorage.getItem("savedModelPhoto");
    if (savedPose) {
      setSelectedLocalPose(savedPose);
    }
  }, []);

  // Listen for external requests to load a model image into the mirror
  useEffect(() => {
    const handleLoadModel = (e) => {
      const url = e?.detail?.imageUrl;
      if (url) {
        setSelectedLocalPose(url);
        setVtonResultImage(null);
        setWornItems([]);
        // Scroll mirror into view
        const el = document.querySelector('.mirror-main-box');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    window.addEventListener('load-model-image', handleLoadModel);
    return () => window.removeEventListener('load-model-image', handleLoadModel);
  }, []);

  const [chatMessages, setChatMessages] = useState(initialChatMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // Context states
  const [currentLocation, setCurrentLocation] = useState("Indiranagar, Bengaluru (560038)");
  const [currentWeather, setCurrentWeather] = useState("🌤️ 28°C, Humid");
  const [isCalendarSynced, setIsCalendarSynced] = useState(true);
  
  // Modal states
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState("Indiranagar, Bengaluru (560038)");
  const [tempWeather, setTempWeather] = useState("🌤️ 28°C, Humid");
  const [tempCalendarSync, setTempCalendarSync] = useState(true);
  
  const [calendarEvents, setCalendarEvents] = useState([
    { type: "personal", date: "Saturday", title: "Friend's Haldi Ceremony" },
    { type: "cultural", date: "Sunday", title: "Varamahalakshmi Festival" }
  ]);
  const messagesEndRef = useRef(null);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const [rotation, setRotation] = useState(0);
  const [show360Slider, setShow360Slider] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleMirrorClick = () => {};

  const handleGenerate3D = async () => {
    if (!vtonResultImage && !selectedLocalPose) return;
    setIsGenerating3D(true);
    try {
      const url = await generate3DModel(vtonResultImage || selectedLocalPose);
      setModel3DUrl(url);
      setIs3DMode(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating3D(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedLocalPose(url);
      localStorage.setItem("savedModelPhoto", url);
      setVtonResultImage(null);
      setShowPoseSelector(false);
    }
  };

  const handleGarmentClick = async (garment) => {
    const isWorn = wornItems.find(i => i.id === garment.id);
    let newWornItems = [];
    if (isWorn) {
      newWornItems = wornItems.filter(item => item.id !== garment.id);
      setWornItems(newWornItems);
    } else {
      newWornItems = [...wornItems, garment];
      setWornItems(newWornItems);
    }
    
    if (newWornItems.length === 0) {
      setVtonResultImage(null);
      return;
    }

    setIsGeneratingVton(true);
    setVtonResultImage(null);

    try {
      const basePose = selectedLocalPose || "/pose1 (3).png";
      const modelRes = await fetch(basePose);
      const modelBlob = await modelRes.blob();

      const garmentRes = await fetch(garment.image);
      const garmentBlob = await garmentRes.blob();

      const category = (garment.category === "Bottoms" || garment.category?.toLowerCase().includes("kurta") || garment.name?.toLowerCase().includes("jean")) ? "Lower-body" : "Upper-body";

      const resultUrl = await generateVirtualTryOn(
        modelBlob,
        garmentBlob,
        category
      );

      if (resultUrl) {
        setVtonResultImage(resultUrl);
      }
    } catch (error) {
      console.error("VTON Backend Model Error:", error);
    } finally {
      setIsGeneratingVton(false);
    }
  };

  const removeWornItem = (id) => {
    const garment = wornItems.find(item => item.id === id);
    if (garment) {
      handleGarmentClick(garment);
    }
  };
  const addWornItem = (item) => {
    if (!wornItems.find(i => i.id === item.id)) setWornItems([...wornItems, item]);
  };

  const filteredWardrobe = activeFilter === "All" ? displayItems : displayItems.filter(item => item.category === activeFilter);


  // Chat AI Logic
  const simulateAgent = async (agentName, prompt, userMessage) => {
    if (!apiKey) {
      return new Promise(resolve => {
        setTimeout(() => {
          let response = "";
          if (agentName === "Stylist") response = "Looking at your wardrobe, I'd suggest pairing this with your Tapered Trousers for a sharp look.";
          else if (agentName === "Trend") response = "Great idea! Monochrome styling is trending heavily this season on TikTok.";
          else if (agentName === "Finance") response = "You can get a similar top right now on Myntra for 20% off using your Insider points!";
          resolve(response);
        }, 1500 + Math.random() * 1000);
      });
    }

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${prompt}\nUser says: ${userMessage}` }] }]
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("API Error:", data);
        if (data.error && data.error.message.includes("API key not valid")) {
          return "It looks like the API key provided is invalid. Please check your .env file and ensure you are using a valid Gemini API key (it usually starts with 'AIza').";
        }
        return `API Error: ${data.error ? data.error.message : "Something went wrong"}`;
      }

      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error("Fetch Exception:", e);
      return "I'm having trouble connecting to my database. Please check your internet connection or API key.";
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { type: 'user', text: inputText, sender: 'You' };
    setChatMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText("");
    setIsTyping(true);

    if (currentInput.toLowerCase().includes("mumbai") || currentInput.toLowerCase().includes("travelling")) {
      setTimeout(() => {
        const newLocation = "Colaba, Mumbai (400001)";
        const newEvents = [
          { type: "personal", date: "Friday", title: "Beachfront Dinner" },
          { type: "cultural", date: "Weekend", title: "Ganesh Chaturthi Prep" }
        ];
        setCurrentLocation(newLocation);
        setCalendarEvents(newEvents);
        
        setChatMessages(prev => [
          ...prev, 
          { type: 'agent', sender: 'Stylist', text: 'I see you are heading to Mumbai! The coastal humidity is quite high right now.' },
          { 
            type: 'demand-signal', 
            location: newLocation,
            trend: 'Linen Blends & Breezy Silhouettes',
            events: newEvents
          }
        ]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    if (currentInput.toLowerCase().includes("add event")) {
      setTimeout(() => {
        const newEvent = { type: "personal", date: "Next Week", title: "Office Offsite Party" };
        setCalendarEvents(prev => [...prev, newEvent]);
        setChatMessages(prev => [
          ...prev, 
          { type: 'agent', sender: 'Stylist', text: `Got it, I've added "Office Offsite Party" to your calendar context. I'll keep an eye out for smart-casual outfits that fit the local vibe.` }
        ]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    if (currentInput.toLowerCase().includes("presentation") || currentInput.toLowerCase().includes("office")) {
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev, 
          { type: 'agent', sender: 'Stylist', text: 'Good luck with the presentation! A tailored power suit is perfect for projecting confidence. I found this one in your wardrobe.' },
          { type: 'presentation-proposal' }
        ]);
        
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            { type: 'agent', sender: 'Trend', text: 'Power suits are trending heavily right now in corporate fashion, great choice for a sharp impression.' },
            { type: 'agent', sender: 'Finance', text: 'You bought this suit 2 years ago and only wore it twice—great job rescuing it and lowering your cost per wear!' }
          ]);
          setIsTyping(false);
        }, 1200);
      }, 1000);
      return;
    }

    // Context string for agents
    const contextInfo = `Context: User is in ${currentLocation}. Weather is ${currentWeather}. Calendar Sync is ${isCalendarSynced ? 'ON' : 'OFF'}.`;

    // 1. Stylist Speaks
    const stylistPrompt = `You are the Style Strategist. You know the user's wardrobe. ${contextInfo} Keep it to 2 short sentences. Format casually.`;
    const stylistResponse = await simulateAgent("Stylist", stylistPrompt, currentInput);
    setChatMessages(prev => [...prev, { type: 'agent', sender: 'Stylist', text: stylistResponse }]);

    // 2. Trend Speaks
    const trendPrompt = `You are the Trend Agent. Suggest something trendy related to what the Stylist said, factoring in the ${currentLocation} weather (${currentWeather}). Keep it to 1 short sentence.`;
    const trendResponse = await simulateAgent("Trend", trendPrompt, currentInput);
    setChatMessages(prev => [...prev, { type: 'agent', sender: 'Trend', text: trendResponse }]);

    // 3. Finance Speaks
    const financePrompt = `You are the Finance Agent. Find discounts or Myntra Insider deals for the suggested items. Keep it to 1 short sentence.`;
    const financeResponse = await simulateAgent("Finance", financePrompt, currentInput);
    setChatMessages(prev => [...prev, { type: 'agent', sender: 'Finance', text: financeResponse }]);

    setIsTyping(false);
  };

  const handleSaveLook = () => {
    setShowShareOptions(true);
  };

  return (
    <div className="premium-studio-page">
      {isContextModalOpen && (
        <div className="premium-modal-overlay">
          <div className="premium-modal" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Real-World Context</h3>
            
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>📍 Current Location / City</label>
              <select 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                value={tempLocation}
                onChange={(e) => {
                  setTempLocation(e.target.value);
                  if(e.target.value.includes('Mumbai')) setTempWeather('🌦️ 31°C, High Humidity');
                  else if(e.target.value.includes('Delhi')) setTempWeather('🔥 38°C, Dry Heat');
                  else setTempWeather('🌤️ 28°C, Breezy');
                }}
              >
                <option value="Indiranagar, Bengaluru (560038)">Indiranagar, Bengaluru (560038)</option>
                <option value="Colaba, Mumbai (400001)">Colaba, Mumbai (400001)</option>
                <option value="Connaught Place, Delhi (110001)">Connaught Place, Delhi (110001)</option>
              </select>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" checked={tempCalendarSync} onChange={(e) => setTempCalendarSync(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              <div>
                <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', color: '#111' }}>Sync Local & Personal Calendar</label>
                <span style={{ fontSize: '11px', color: '#888' }}>Pulls cultural events based on city and personal schedule</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="premium-btn-secondary full-width" onClick={() => setIsContextModalOpen(false)}>Cancel</button>
              <button className="premium-btn-primary full-width" onClick={() => {
                setCurrentLocation(tempLocation);
                setCurrentWeather(tempWeather);
                setIsCalendarSynced(tempCalendarSync);
                setIsContextModalOpen(false);
                
                // Add a chat message saying context updated
                setChatMessages(prev => [...prev, {
                  type: 'agent', sender: 'System', text: `Context successfully updated to ${tempLocation}. Weather: ${tempWeather}. Calendar Sync is ${tempCalendarSync ? 'Active' : 'Inactive'}. I will now tailor my styling advice accordingly.`
                }]);
              }}>Save Context</button>
            </div>
          </div>
        </div>
      )}

      <div className="premium-studio-container">
        
        {/* LEFT PANE: WARDROBE */}
        <div className="studio-wardrobe-pane">
          <div className="wardrobe-header">
            <h2>Wardrobe</h2>
            <div className="wardrobe-stats">{displayItems.length} Pieces • 72% Utilization</div>
          </div>

          <div className="wardrobe-filters">
            {availableCategories.map(f => (
              <div 
                key={f} 
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </div>
            ))}
          </div>

          <div className="wardrobe-upload-section">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/*" />
            <button className="premium-btn-secondary full-width" onClick={() => fileInputRef.current.click()}>
              + Upload Model Photo
            </button>
          </div>

          <div className="attention-card">
            <div className="attention-icon">!</div>
            <div className="attention-text">
              <h4>2 pieces need attention</h4>
              <p>Silk Slip unworn 8 months. Restyle it today.</p>
            </div>
          </div>

          <div className="wardrobe-grid">
            {filteredWardrobe.map(item => (
              <div key={item.id} className="garment-card" onClick={() => handleGarmentClick(item)}>
                <div className="garment-image-wrapper">
                  <div className={`garment-status status-${item.status}`}>
                    {item.status.replace('-', ' ')}
                  </div>
                  <img src={item.image} alt={item.name} className="garment-image" />
                </div>
                <div className="garment-info">
                  <h4>{item.name}</h4>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                    <p style={{margin: 0}}>{item.brand}</p>
                    <p style={{margin: 0, fontWeight: 'bold', color: '#111'}}>₹{item.price}</p>
                  </div>
                  <div className="garment-usage-bar">
                    <div className={`usage-fill ${item.status}`} style={{ width: `${item.usage}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER PANE: MIRROR (Virtual Try-On) */}
        <div className="studio-mirror-pane">
          <div className="premium-card mirror-main-box">
            
            <div className="mirror-top-controls">
              <div className="mirror-label">MIRROR</div>
              <div className="mirror-btn-row">
                <button 
                  className="mirror-icon-btn" 
                  onClick={() => setShow360Slider(!show360Slider)}
                  style={{ background: show360Slider ? '#111' : 'white', color: show360Slider ? 'white' : '#111' }}
                >↻</button>
                <button className="mirror-icon-btn">☼</button>
                <button 
                  className="mirror-icon-btn"
                  onClick={handleGenerate3D}
                  style={{ background: is3DMode ? '#111' : 'white', color: is3DMode ? 'white' : '#111' }}
                  disabled={isGenerating3D}
                >
                  {isGenerating3D ? '...' : '3D'}
                </button>
              </div>
            </div>



            <div className="mirror-image-container" onClick={handleMirrorClick}>
              {(vtonResultImage || selectedLocalPose) ? (
                is3DMode ? (
                  <model-viewer
                    src={model3DUrl}
                    alt="3D Generated Try-On"
                    camera-controls
                    auto-rotate
                    style={{ width: '100%', height: '80%', marginBottom: '150px' }}
                  ></model-viewer>
                ) : (
                  <img 
                    src={vtonResultImage || selectedLocalPose} 
                    alt="Virtual Try-On Model" 
                    className={`mirror-model-image ${isGeneratingVton ? 'loading-blur' : ''}`}
                    style={{ 
                      transform: `rotateY(${rotation}deg)`, 
                      transition: 'transform 0.1s linear', 
                      transformStyle: 'preserve-3d' 
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (selectedLocalPose) localStorage.removeItem("savedModelPhoto");
                    }}
                    onLoad={(e) => e.target.style.display = 'block'}
                  />
                )
              ) : (
                <div 
                  className="mirror-empty-state" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#282c3f', flexDirection: 'column', padding: '20px', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <span style={{ fontSize: '48px', marginBottom: '12px' }}>📸</span>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Upload Your Model Photo</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#696e79' }}>Upload your photo to try on clothes using DCI-VTON AI</p>
                  <button className="premium-btn-secondary" style={{ background: '#ff3f6c', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' }}>
                    Select Photo 📁
                  </button>
                </div>
              )}
              
              {show360Slider && (vtonResultImage || selectedLocalPose) && (
                <div style={{
                  position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', 
                  background: 'rgba(255,255,255,0.95)', padding: '12px 24px', borderRadius: '30px', 
                  display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
                  zIndex: 20, backdropFilter: 'blur(10px)', border: '1px solid #f0f0f0'
                }}>
                  <span style={{fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#111'}}>360° VIEW</span>
                  <input 
                    type="range" min="0" max="360" value={rotation} 
                    onChange={(e) => setRotation(e.target.value)} 
                    style={{width: '180px', accentColor: '#111', cursor: 'ew-resize'}} 
                  />
                </div>
              )}

              {isGeneratingVton && (
                <div className="vton-overlay-loader">
                  <div className="spinner"></div>
                  <p>Applying garment...</p>
                </div>
              )}
              
              {(selectedLocalPose && !showPoseSelector) && wornItems.map((item, idx) => {
                let tagClass = "tag-pos-middle";
                const cat = (item.category || "").toLowerCase();
                if (cat.includes("top") || cat.includes("kurta") || cat.includes("shirt")) tagClass = "tag-pos-top";
                if (cat.includes("bottom") || cat.includes("trouser") || cat.includes("saree") || cat.includes("set")) tagClass = "tag-pos-bottom";
                if (cat.includes("shoe") || cat.includes("footwear")) tagClass = "tag-pos-feet";
                
                return (
                  <div key={item.id} className={`floating-garment-tag ${tagClass}`}>
                    <img src={item.image} alt={item.name} className="tag-thumb" />
                    <span>{item.name.toUpperCase()}</span>
                    <button className="tag-close" onClick={(e) => { e.stopPropagation(); removeWornItem(item.id); }}>×</button>
                  </div>
                );
              })}

              {showShareOptions && (
                <div className="vton-share-overlay" style={{
                  position: 'absolute', bottom: '20%', left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(255, 255, 255, 0.95)', padding: '20px', borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '10px',
                  zIndex: 10, textAlign: 'center', minWidth: '220px'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Look Saved! 🎉</h4>
                  <button className="premium-btn-primary full-width" onClick={() => {
                    const getupItem = {
                      id: 'vton_getup_' + Date.now(),
                      brand: 'Myntra Studio',
                      title: 'Restyled Outfit Look',
                      imageUrl: vtonResultImage || selectedLocalPose,
                      price: 1999,
                      originalPrice: 2499,
                      discount: '(20% OFF)',
                      addedBy: 'You'
                    };
                    if (squads && squads.length > 0) {
                      setGetupToShare(getupItem);
                      setShowSquadModal(true);
                      setShowShareOptions(false);
                    } else {
                      if (addToCart) addToCart(getupItem, 'M', 'Mixed', true);
                      alert('Shared getup to split bag!');
                      setShowShareOptions(false);
                    }
                  }}>
                    Share Getup to Squad
                  </button>
                  <button className="premium-btn-secondary full-width" onClick={() => { 
                    if (addToCart) {
                      const getupItem = {
                        id: 'vton_getup_' + Date.now(),
                        brand: 'Myntra Studio',
                        title: 'Restyled Outfit Look',
                        imageUrl: vtonResultImage || selectedLocalPose,
                        price: 1999,
                        originalPrice: 2499,
                        discount: '(20% OFF)',
                        addedBy: 'You'
                      };
                      addToCart(getupItem, 'M', 'Mixed', false);
                    }
                    alert('Added Getup to My Bag!'); 
                    setShowShareOptions(false); 
                  }}>
                    Add Getup to My Bag
                  </button>
                  <button style={{background:'transparent', border:'none', cursor:'pointer', marginTop:'5px', color:'#888'}} onClick={(e) => {e.stopPropagation(); setShowShareOptions(false);}}>
                    Close
                  </button>
                </div>
              )}

            </div>

            <div className="mirror-bottom-bar">
              <div className="live-look-info">
                <div className="mini-thumbs">
                  {wornItems.map(item => (
                    <img key={item.id} src={item.image} alt={item.name} />
                  ))}
                </div>
                <div className="live-look-text">
                  <h5>LIVE LOOK</h5>
                  <p>{wornItems.length} pieces • Restyled</p>
                </div>
              </div>
              <div className="mirror-actions">
                <button className="premium-btn-secondary" onClick={handleSaveLook}>Save Look</button>
                <button className="premium-btn-primary">📷 Capture</button>
              </div>
            </div>
          </div>


        </div>

        {/* RIGHT PANE: STYLE STRATEGIST (Chat) */}
        <div className="premium-card studio-chat-pane">
          <div className="chat-header" style={{ paddingBottom: '10px', borderBottom: 'none' }}>
            <div className="chat-avatar">✧</div>
            <div className="chat-header-info">
              <h3>Style Strategist</h3>
              <p>Knows your closet • Suggesting for today</p>
            </div>
            <button className="chat-history-btn">History</button>
          </div>
          <div className="context-bar" style={{ padding: '0 25px 15px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div className="weather-badge" style={{ background: '#f0f4ff', color: '#3b5bdb', padding: '6px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {currentWeather}
            </div>
            <div className="weather-badge" style={{ background: '#f3f0ff', color: '#5f3dc4', padding: '6px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
              📍 {currentLocation.split(',')[0]}
            </div>
            <button 
              onClick={() => setIsContextModalOpen(true)}
              style={{ marginLeft: 'auto', background: 'white', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '15px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
            >
              ⚙️ Adjust Context
            </button>
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg, idx) => {
              if (msg.type === 'system-intro') {
                return (
                  <div key={idx} className="chat-message system">
                    <p>Morning, Sarah! It's a sunny 24°C weekend ahead. Since you're heading to the outdoor music festival at 15:00, I've curated a comfortable yet chic festival look. I paired your new <span className="highlight-text">Crochet Lace Top</span> with those <span className="highlight-text">Baggy Jeans</span> for effortless movement, and added the Fastrack Shades to keep you looking sharp all day.</p>
                    <p style={{marginTop: 15, fontSize: 12, color: '#666'}}>Click "Apply to mirror" below to see the full look.</p>
                  </div>
                );
              }
              if (msg.type === 'proposal') {
                return (
                  <div key={idx} className="proposal-card">
                    <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=400&auto=format&fit=crop" alt="Outfit Layout" className="proposal-image" />
                    <div className="proposal-details">
                      <h4>Weekend Festival • Lace & Denim</h4>
                      <div className="proposal-items">
                        <img src="/custom-top.png" alt="Top" />
                        <img src="/custom-jeans.png" alt="Jeans" />
                        <img src="/custom-sunglasses.png" alt="Sunglasses" />
                        <img src="/custom-shoe.png" alt="Shoes" />
                      </div>
                      <div className="proposal-actions">
                        <button className="premium-btn-primary full-width" onClick={() => {
                          const top = wardrobeItems.find(i => i.id === 1);
                          const jeans = wardrobeItems.find(i => i.id === 2);
                          const glasses = wardrobeItems.find(i => i.id === 3);
                          const shoes = wardrobeItems.find(i => i.id === 4);
                          
                          setSelectedLocalPose(localPoses[0].image);
                          setWornItems([top, jeans, glasses, shoes]);
                          setIsGeneratingVton(true);
                          setTimeout(() => {
                            setVtonResultImage('/top_jeans_glass_shoes.png');
                            setIsGeneratingVton(false);
                          }, 1500);
                        }}>Apply to mirror</button>
                        <button className="premium-btn-secondary full-width">Alternatives</button>
                      </div>
                    </div>
                  </div>
                );
              }
              if (msg.type === 'alert') {
                return (
                  <div key={idx} className="before-you-buy-card">
                    <div className="before-you-buy-header">
                      <span>🛍</span> BEFORE YOU BUY
                    </div>
                    <p>You already own the <span className="highlight-text">COS Tapered Trouser</span> in a near-identical cut — pair it 4 ways before duplicating.</p>
                    <button className="premium-btn-secondary full-width" style={{background: '#f0eaff', color: '#5a4bda', borderColor: 'transparent'}}>Show pairings</button>
                  </div>
                );
              }
              if (msg.type === 'demand-signal') {
                return (
                  <div key={idx} className="before-you-buy-card" style={{ background: '#fff8f0', borderColor: '#ffd8a8', marginTop: 15 }}>
                    <div className="before-you-buy-header" style={{ color: '#e67700' }}>
                      <span>📈</span> LOCAL PULSE: {msg.location || currentLocation}
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>Upcoming Context:</div>
                      <ul style={{ margin: '5px 0 10px 20px', padding: 0, fontSize: 12, color: '#555' }}>
                        {(msg.events || calendarEvents).map((ev, i) => (
                          <li key={i}><strong>{ev.date}:</strong> {ev.title} <em>({ev.type})</em></li>
                        ))}
                      </ul>
                    </div>
                    <p style={{ fontSize: 13, marginBottom: 15, color: '#444', lineHeight: 1.5 }}>Tracking this local context and <strong>real-time checkout velocity</strong>, <span className="highlight-text">{msg.trend || 'Festive Kurtas'}</span> are highly trending. Creator trends show a 40% spike in styling this locally.</p>
                    <button className="premium-btn-secondary full-width" style={{background: '#fff4e6', color: '#e67700', borderColor: 'transparent', fontSize: 12}}>Sync Catalog to {msg.location || currentLocation}</button>
                  </div>
                );
              }
              
              if (msg.type === 'presentation-proposal') {
                return (
                  <div key={idx} className="proposal-card">
                    <img src="https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=400&auto=format&fit=crop" alt="Office Vibe" className="proposal-image" />
                    <div className="proposal-details">
                      <h4>Board Presentation • Power Suit</h4>
                      <div className="proposal-items">
                        <img src="/custom-yellow-suit.png" alt="Office Suit" />
                      </div>
                      <div className="proposal-actions">
                        <button className="premium-btn-primary full-width" onClick={() => {
                          setSelectedLocalPose(localPoses[0].image);
                          setWornItems([{ id: 99, name: "Yellow Power Suit", category: "Sets", image: "/custom-yellow-suit.png", price: 3500 }]);
                          setIsGeneratingVton(true);
                          setTimeout(() => {
                            setVtonResultImage('/officesuit.png');
                            setIsGeneratingVton(false);
                          }, 1500);
                        }}>Apply to mirror</button>
                        <button className="premium-btn-secondary full-width">Alternatives</button>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Dynamic messages
              return (
                <div key={idx} className={`chat-message ${msg.type === 'user' ? 'user-msg' : 'agent-msg'}`}>
                  {msg.type !== 'user' && <div className="message-sender" style={{fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 4}}>{msg.sender}</div>}
                  {msg.type === 'user' && <div className="message-sender" style={{fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#111', marginBottom: 4, textAlign: 'right'}}>{msg.sender}</div>}
                  <p style={{background: msg.type === 'user' ? '#f5f5f5' : 'transparent', padding: msg.type === 'user' ? '12px 16px' : 0, borderRadius: msg.type === 'user' ? '16px 16px 0 16px' : 0, marginLeft: msg.type === 'user' ? 'auto' : 0, display: 'inline-block', maxWidth: '90%'}}>
                    {msg.text}
                  </p>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="chat-message agent-msg">
                <p style={{color: '#888', fontStyle: 'italic'}}>The Crew is typing...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSendMessage}>
            <div className="suggestion-chips">
              <span onClick={() => {setInputText("Travelling to Mumbai");}}>📍 Travelling to Mumbai</span>
              <span onClick={() => {setInputText("Add event: Office Offsite");}}>📅 Add event: Office Offsite</span>
              <span onClick={() => {setInputText("Style for office");}}>Style for office</span>
            </div>
            <div className="chat-input-box">
              <input 
                type="text" 
                placeholder="Ask your stylist anything..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="send-btn" disabled={isTyping || !inputText.trim()}>↑</button>
            </div>
          </form>
        </div>
      </div>

      {showSquadModal && (
        <div className="squad-select-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="squad-select-modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Select Squad to share getup with</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {(squads || []).map(squad => (
                <button 
                  key={squad.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', border: '1px solid #eee', borderRadius: '8px', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => {
                    if (setActiveSquadId) setActiveSquadId(squad.id);
                    if (addToCart && getupToShare) {
                      addToCart(getupToShare, 'M', 'Mixed', true);
                    }
                    setShowSquadModal(false);
                    setGetupToShare(null);
                    alert(`Getup shared to ${squad.name}!`);
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{squad.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#282c3f', fontSize: '16px' }}>{squad.name}</div>
                    <div style={{ color: '#535665', fontSize: '12px' }}>{squad.members?.length || 0} members</div>
                  </div>
                </button>
              ))}
            </div>
            <button 
              style={{ marginTop: '15px', width: '100%', padding: '10px', background: '#ff3f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => { setShowSquadModal(false); setGetupToShare(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Studio;
