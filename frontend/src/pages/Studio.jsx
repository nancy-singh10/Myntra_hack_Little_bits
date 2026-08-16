import React, { useState, useRef, useEffect } from 'react';
import './Studio.css';
import { generateVirtualTryOn } from '../services/gradioVtonService';
import { generate3DModel } from '../services/gradio3DService';
import { allProducts } from '../data/mockProducts';

// Mock Data (fallback)
const wardrobeItems = [
  { id: 1, name: "Crochet Lace Top", brand: "Urbanic", category: "Tops", status: "loved", usage: 34, image: "/custom-top.png", price: 560 },
  { id: 12, name: "Black Floral Top", brand: "Boutique", category: "Tops", status: "loved", usage: 10, image: "/meetingcptop.png", price: 899 },
  { id: 11, name: "Blue Festive Lehenga", brand: "Biba", category: "Sets", status: "loved", usage: 3, image: "/lehenga_.png", price: 12500 },
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
  { type: 'greeting', text: "Hi Nancy — good morning. Here's your day and what I'd wear for it." },
  { type: 'context-pill', location: "Location: Delhi", temp: "38°C", weather: "Dry Heat" },
  {
    type: 'schedule', events: [
      { date: "Aug 24", time: "14:00", title: "Client Meeting, CP", desc: "Sharp, quiet" },
      { date: "Aug 25", time: "19:30", title: "Dinner, Hauz Khas", desc: "Softer, evening" }
    ]
  },
  { type: 'section-title', text: "Three looks, all from pieces you own:" },
  { type: 'proposal', title: "Meeting - CP", badge: "Best for 14:00", desc: "Breathable cotton, structured shoulder for the 14:00 room.", items: ["/meetingcptop.png"], style_agent: "The sheer sleeves and floral pattern commands attention in the boardroom while the lightweight material keeps you cool during the 2 PM heat.", finance_agent: "Investing in this statement piece lowers your cost-per-wear since it easily transitions from formal meetings to casual Fridays." },
  { type: 'proposal', title: "Desk to Dinner", badge: "Layer down", badgeColor: "#f3e8ff", desc: "Swap the blazer for a relaxed tee at 18:00 — same base.", items: ["/custom-top.png", "/custom-jeans.png", "/custom-shoe.png"], style_agent: "By removing the formal blazer, you instantly shift the vibe from professional to evening casual without changing your core outfit.", finance_agent: "Versatile base layers like these jeans save you money—buy once, style twice!" },
  { type: 'proposal', title: "Evening, Hauz Khas", badge: "Restyle dormant", badgeColor: "#f3e8ff", desc: "Wakes up the denim jacket that has rested 8 months.", items: ["/custom-top.png", "/custom-jeans.png", "/custom-shoe.png"], style_agent: "A classic denim pairing brings back that effortless Hauz Khas party vibe, perfectly reviving your dormant jacket.", finance_agent: "Restyling an old jacket from your wardrobe saves you from buying a new one. Smart closet economics!" },
  { type: 'section-title', text: "One cultural event is coming up on your calendar:" },
  {
    type: 'cultural-event', title: "Raksha Bandhan Celebration", time: "From your calendar • Aug 28", desc: "Festive, warm tones, indoor-to-terrace. Guests dress traditional-modern.", looks: [
      { title: "Festive Suit", badge: "Traditional-modern", desc: "Embroidered Suit with the tote — jewel-tone shawl adds the festive read.", items: ["/custom-yellow-suit.png", "/suitpant.png", "/custom-shoe.png"] },
      { title: "Tailored Celebration", badge: "Smart", desc: "Blazer over linen keeps it respectful for elders present.", items: ["/kurti-1.png", "/suitpant.png", "/custom-shoe.png"] },
      { title: "Terrace Evening", badge: "Relaxed", desc: "Light layers for the 9pm temperature drop on the terrace.", items: ["/kurti-1.png", "/custom-shoe.png"] }
    ]
  }
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
  const [isRemovingBackground, setIsRemovingBackground] = useState(false);
  const fileInputRef = useRef(null);

  const [showPoseSelector, setShowPoseSelector] = useState(false);
  const [tempUploadedPhoto, setTempUploadedPhoto] = useState(null);

  const [is3DMode, setIs3DMode] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);

  // Disable auto-loading saved pose on mount
  useEffect(() => {
    // Intentionally left empty to ask user to upload an image on reload
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

  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedAgents, setExpandedAgents] = useState({});

  const fetchFeed = (loc, icalUrlToUse) => {
    let url = `http://127.0.0.1:8000/stylist/feed/?location=${encodeURIComponent(loc)}`;
    if (icalUrlToUse) {
      url += `&ical_url=${encodeURIComponent(icalUrlToUse)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setCurrentLocation(data.location || loc);
        if (data.weather) {
          setCurrentWeather(`${data.weather.temp}, ${data.weather.description}`);
        }

        const newMessages = [];
        if (data.greeting) newMessages.push({ type: 'greeting', text: data.greeting });

        newMessages.push({
          type: 'context-pill',
          location: (data.location || loc).split(',')[0],
          temp: data.weather?.temp || "28°C",
          weather: data.weather?.description || "Humid",
          forecast: data.forecast || []
        });

        const isDelhi = loc.toLowerCase().includes('delhi');

        if (isDelhi && data.events && data.events.length > 0) {
          newMessages.push({
            type: 'schedule',
            events: data.events.map(e => ({
              date: e.date || "",
              time: e.time || "12:00",
              title: e.title || "Event",
              desc: e.subtitle || e.desc || ""
            }))
          });
        }

        if (data.outfits_heading) newMessages.push({ type: 'section-title', text: data.outfits_heading });

        if (data.outfits && data.outfits.length > 0) {
          data.outfits.forEach((outfit, index) => {
            // Provide dynamic local fallback images based on the chosen city if the AI sends dummy placeholders
            const isLucknow = loc.toLowerCase().includes('lucknow');
            const localFallbacks = isLucknow ? [
              ["/kurti-1.png", "/suitpant.png", "/custom-shoe.png"],
              ["/custom-yellow-suit.png", "/custom-shoe.png", "/custom-shoe.png"]
            ] : [
              ["/orange_tie_top.png", "/custom-jeans.png", "/custom-shoe.png"],
              ["/custom-top.png", "/custom-jeans.png", "/custom-shoe.png"]
            ];
            const safeItems = (outfit.items && outfit.items.length > 0)
              ? outfit.items.map((i, imgIdx) => {
                if (i.image_url && !i.image_url.includes('placeholder')) return i.image_url;
                return localFallbacks[index % 2][imgIdx % 3];
              })
              : localFallbacks[index % 2];

            newMessages.push({
              type: 'proposal',
              title: outfit.title,
              badge: outfit.tag,
              desc: outfit.description || outfit.desc,
              items: safeItems,
              style_agent: outfit.style_agent,
              finance_agent: outfit.finance_agent
            });
          });
        }

        if (isDelhi) {
          newMessages.push({ type: 'section-title', text: "One cultural event is coming up on your calendar:" });
          newMessages.push({
            type: 'cultural-event', title: "Raksha Bandhan Celebration", time: "From your calendar • Aug 28", desc: "Festive, warm tones, indoor-to-terrace. Guests dress traditional-modern.", looks: [
              { title: "Festive Suit", badge: "Traditional-modern", desc: "Embroidered Suit with the tote — jewel-tone shawl adds the festive read.", items: ["/custom-yellow-suit.png", "/suitpant.png", "/custom-shoe.png"] },
              { title: "Tailored Celebration", badge: "Smart", desc: "Blazer over linen keeps it respectful for elders present.", items: ["/kurti-1.png", "/suitpant.png", "/custom-shoe.png"] },
              { title: "Terrace Evening", badge: "Relaxed", desc: "Light layers for the 9pm temperature drop on the terrace.", items: ["/kurti-1.png", "/custom-shoe.png"] }
            ]
          });
        }

        setChatMessages(newMessages);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    // Fetch dynamically on load to get the real calendar events and weather
    fetchFeed("Connaught Place, Delhi (110001)");
  }, []);

  // Context states
  const [currentLocation, setCurrentLocation] = useState("Connaught Place, Delhi (110001)");
  const [currentWeather, setCurrentWeather] = useState("🔥 38°C, Dry Heat");
  const [isCalendarSynced, setIsCalendarSynced] = useState(true);

  // Modal states
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);
  const [tempLocation, setTempLocation] = useState("Connaught Place, Delhi (110001)");
  const [tempWeather, setTempWeather] = useState("🔥 38°C, Dry Heat");
  const [tempCalendarSync, setTempCalendarSync] = useState(true);
  const [tempIcalUrl, setTempIcalUrl] = useState("");
  const [currentIcalUrl, setCurrentIcalUrl] = useState("");

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

  const handleMirrorClick = () => { };

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
      setVtonResultImage(null);
      setShowPoseSelector(false);
      setIsRemovingBackground(false);

      // After 2 seconds show the removing background loader
      setTimeout(() => {
        setIsRemovingBackground(true);
      }, 2000);

      // Change the model image to /model_2.0.png after 8 seconds
      setTimeout(() => {
        setIsRemovingBackground(false);
        setSelectedLocalPose('/model_2.0.png');
        localStorage.setItem("savedModelPhoto", '/model_2.0.png');
      }, 8000);
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

    const hasBrownTop = newWornItems.find(i => i.id === 12 || i.name === "Black Floral Top");
    const hasBaggyJeans = newWornItems.find(i => i.id === 2 || i.name === "Baggy Jeans");
    const hasChickenkari = newWornItems.find(i => (i.image && i.image.includes("chickenkari_top.png")) || (typeof i === 'string' && i.includes("chickenkari_top.png")));

    // Mock VTON for Chickenkari Top
    if (hasChickenkari) {
      setTimeout(() => {
        setVtonResultImage('/chcikenkurtamodel.jpeg');
        setIsGeneratingVton(false);
      }, 8000);
      return;
    }

    // Mock VTON for Brown Top + Baggy Jeans combo
    if (hasBrownTop && hasBaggyJeans) {
      setTimeout(() => {
        setVtonResultImage('/browntopjeans.png');
        setIsGeneratingVton(false);
      }, 3000);
      return;
    }

    // Mock VTON for the "Black Floral Top" (which shows a brown top image)
    if (hasBrownTop) {
      setTimeout(() => {
        setVtonResultImage('/browntomodel.jpeg');
        setIsGeneratingVton(false);
      }, 8000);
      return;
    }

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

    const lowerInput = currentInput.toLowerCase();

    // Dynamic Location Detection
    const locationMatch = currentInput.match(/(?:travelling to|going to|heading to|in) ([a-zA-Z\s]+)/i);

    if (locationMatch || lowerInput.includes("mumbai") || lowerInput.includes("delhi") || lowerInput.includes("bangalore")) {
      const detectedLocation = locationMatch ? locationMatch[1].trim() : currentInput;

      // Fetch from our new dynamic backend endpoint
      fetch(`http://127.0.0.1:8000/stylist/feed/?location=${encodeURIComponent(detectedLocation)}`)
        .then(res => res.json())
        .then(data => {
          setCurrentLocation(data.location);
          setCalendarEvents(data.events);

          setChatMessages(prev => {
            const newMessages = [
              ...prev,
              { type: 'agent', sender: 'Stylist', text: data.greeting },
              {
                type: 'demand-signal',
                location: data.location,
                trend: data.trends.trending_items.join(' & '),
                events: data.events
              }
            ];

            const processItems = (items) => {
              if (items && Array.isArray(items) && items.length > 0) {
                return items.map(item => {
                  if (typeof item === 'object') {
                    let itemName = (item.name || "").toLowerCase();
                    if (itemName.includes('white') || itemName.includes('tee') || itemName.includes('shirt')) {
                      return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop";
                    } else if (itemName.includes('jeans') || itemName.includes('trouser') || itemName.includes('pant') || itemName.includes('bottom')) {
                      return "/custom-jeans.png";
                    } else if (itemName.includes('shoe') || itemName.includes('loafer') || itemName.includes('sneaker')) {
                      return "/custom-shoe.png";
                    } else if (itemName.includes('blazer') || itemName.includes('jacket') || itemName.includes('coat')) {
                      return "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop";
                    } else if (itemName.includes('top')) {
                      return "/meetingcptop.png";
                    }
                    return item.image_url && !item.image_url.includes('placeholder') ? item.image_url : "/meetingcptop.png";
                  }
                  return item;
                });
              }

              const query = currentInput.toLowerCase();
              if (query.includes('lehenga')) {
                return ["/lehenga_.png"];
              }
              const isLucknow = currentLocation.toLowerCase().includes('lucknow');
              if (isLucknow && (query.includes('chickenkari') || query.includes('chikankari') || query.includes('kurta'))) {
                return ["/chickenkari_top.png"];
              }
              if (isLucknow) return ["/kurti-1.png", "/suitpant.png", "/custom-shoe.png"];
              return ["/meetingcptop.png", "/custom-jeans.png", "/custom-shoe.png"];
            };

            if (data.outfits && data.outfits.length > 0) {
              data.outfits.forEach(outfit => {
                const isBeti = currentInput.toLowerCase().includes('beti') || currentInput.toLowerCase().includes('lehenga');
                newMessages.push({
                  type: 'proposal',
                  title: outfit.title,
                  desc: isBeti ? "Yeh aapki beti pe bahut accha lagega!" : (outfit.desc || outfit.style_agent || "Perfect outfit curated for you."),
                  items: processItems(outfit.items),
                  style_agent: isBeti ? "Yeh lehenga aapki beti pe bahut accha lagega! Iska design festival aur family gathering ke liye perfect hai." : (outfit.style_agent || outfit.desc || "Style carefully curated based on local climate and cultural trends."),
                  finance_agent: outfit.finance_agent || "Smart economical choice maximizing cost-per-wear."
                });
              });
            } else if (data.outfit && data.outfit.items && data.outfit.items.length > 0) {
              const isBeti = currentInput.toLowerCase().includes('beti') || currentInput.toLowerCase().includes('lehenga');
              newMessages.push({
                type: 'proposal',
                title: data.outfit.title,
                desc: isBeti ? "Yeh aapki beti pe bahut accha lagega!" : (data.outfit.desc || data.outfit.style_agent || "Perfect outfit curated for you."),
                items: processItems(data.outfit.items),
                style_agent: isBeti ? "Yeh lehenga aapki beti pe bahut accha lagega! Iska design festival aur family gathering ke liye perfect hai." : (data.outfit.style_agent || data.outfit.desc || "Style carefully curated based on local climate and cultural trends."),
                finance_agent: data.outfit.finance_agent || "Smart economical choice maximizing cost-per-wear."
              });
            }

            if (data.finance_warnings && data.finance_warnings.length > 0) {
              newMessages.push({
                type: 'alert',
                warnings: data.finance_warnings
              });
            }

            return newMessages;
          });
          setIsTyping(false);
        })
        .catch(err => {
          console.error("Backend fetch error", err);
          setIsTyping(false);
        });
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

    // Dynamic Recommendation Engine
    try {
      const res = await fetch(`http://127.0.0.1:8000/stylist/recommend/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentInput, location: currentLocation })
      });
      const data = await res.json();

      setChatMessages(prev => {
        let newMessages = [...prev];
        const outfits = Array.isArray(data) ? data : (data.outfits ? data.outfits : [data]);

        const processItemsFallback = (items) => {
          const query = currentInput.toLowerCase();
          if (query.includes('lehenga') || query.includes('beti')) {
            return ["/lehenga_.png"];
          }
          if (currentLocation.toLowerCase().includes('lucknow') && (query.includes('chickenkari') || query.includes('chikankari') || query.includes('kurta'))) {
            return ["/chickenkari_top.png"];
          }
          if (items && Array.isArray(items) && items.length > 0) {
            return items.map(item => {
              if (typeof item === 'object') {
                let itemName = (item.name || "").toLowerCase();
                if (itemName.includes('white') || itemName.includes('tee') || itemName.includes('shirt')) return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop";
                if (itemName.includes('jeans') || itemName.includes('trouser') || itemName.includes('pant') || itemName.includes('bottom')) return "/custom-jeans.png";
                if (itemName.includes('shoe') || itemName.includes('loafer') || itemName.includes('sneaker')) return "/custom-shoe.png";
                if (itemName.includes('blazer') || itemName.includes('jacket') || itemName.includes('coat')) return "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=400&auto=format&fit=crop";
                if (itemName.includes('top')) return "/meetingcptop.png";
                return item.image_url && !item.image_url.includes('placeholder') && item.image_url.startsWith('http') ? item.image_url : "/meetingcptop.png";
              }
              return item;
            });
          }
          return ["/meetingcptop.png", "/custom-jeans.png", "/custom-shoe.png"];
        };

        outfits.forEach(outfit => {
          const isBeti = currentInput.toLowerCase().includes('beti') || currentInput.toLowerCase().includes('lehenga');
          newMessages.push({
            type: 'proposal',
            title: outfit.title,
            desc: isBeti ? "Yeh aapki beti pe bahut accha lagega!" : (outfit.desc || outfit.style_agent || "Perfect outfit curated for you."),
            items: processItemsFallback(outfit.items),
            style_agent: isBeti ? "Yeh lehenga aapki beti pe bahut accha lagega! Iska design festival aur family gathering ke liye perfect hai." : (outfit.style_agent || outfit.desc || "Style carefully curated based on local climate and cultural trends."),
            finance_agent: outfit.finance_agent || "Smart economical choice maximizing cost-per-wear."
          });
        });
        return newMessages;
      });
    } catch (err) {
      console.error("Backend fetch error", err);
      setChatMessages(prev => [...prev, { type: 'agent', sender: 'System', text: "Error fetching recommendation." }]);
    }

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
              <input
                list="city-options"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                value={tempLocation}
                placeholder="Type any city..."
                onChange={(e) => {
                  setTempLocation(e.target.value);
                  const val = e.target.value.toLowerCase();
                  if (val.includes('lucknow')) setTempWeather('☀️ 32°C, Sunny');
                  else if (val.includes('delhi')) setTempWeather('🔥 38°C, Dry Heat');
                  else if (val.includes('jaipur')) setTempWeather('☀️ 35°C, Hot');
                  else if (val.includes('mumbai')) setTempWeather('🌧️ 29°C, Humid');
                  else setTempWeather('🌤️ 26°C, Pleasant');
                }}
              />
              <datalist id="city-options">
                <option value="Eminence Bangalore (560103)" />
                <option value="Hazratganj, Lucknow (226001)" />
                <option value="Connaught Place, Delhi (110001)" />
                <option value="Jaipur, Rajasthan" />
                <option value="Mumbai, Maharashtra" />
                <option value="Kochi, Kerala" />
                <option value="Varanasi, Uttar Pradesh" />
              </datalist>
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
                setCurrentIcalUrl(tempIcalUrl);
                setIsContextModalOpen(false);

                // Add a loading message, then fetch the real feed
                setChatMessages(prev => [...prev, {
                  type: 'agent', sender: 'System', text: `Context successfully updated to ${tempLocation}. Fetching your personalized daily feed...`
                }]);
                fetchFeed(tempLocation, tempIcalUrl);
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ margin: 0 }}>{item.brand}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#111' }}>₹{item.price}</p>
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
                      transform: `scale(${vtonResultImage === '/browntomodel.jpeg' ? 1.5 : 1}) translateY(${vtonResultImage === '/browntomodel.jpeg' ? '12%' : '0%'}) rotateY(${rotation}deg)`,
                      transition: 'transform 0.1s linear',
                      transformStyle: 'preserve-3d',
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
                  <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#111' }}>360° VIEW</span>
                  <input
                    type="range" min="0" max="360" value={rotation}
                    onChange={(e) => setRotation(e.target.value)}
                    style={{ width: '180px', accentColor: '#111', cursor: 'ew-resize' }}
                  />
                </div>
              )}

              {isGeneratingVton && (
                <div className="vton-overlay-loader">
                  <div className="spinner"></div>
                  <p>Applying garment...</p>
                </div>
              )}

              {isRemovingBackground && (
                <div className="vton-overlay-loader">
                  <div className="spinner"></div>
                  <p>Removing background...</p>
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
                    Share Getup to Group
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
                  <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '5px', color: '#888' }} onClick={(e) => { e.stopPropagation(); setShowShareOptions(false); }}>
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
            </div>
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
            {chatMessages.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: '14px' }}>
                <div className="spinner" style={{ margin: '0 auto 15px', border: '3px solid #f3f3f3', borderTop: '3px solid #111', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite' }}></div>
                Curating your feed based on your calendar...
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            {chatMessages.map((msg, idx) => {
              if (msg.type === 'greeting') {
                return (
                  <div key={idx} style={{ fontSize: '15px', color: '#111', lineHeight: '1.5', marginBottom: '16px' }}>
                    {msg.text}
                  </div>
                );
              }
              if (msg.type === 'context-pill') {
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '12px 16px', fontSize: '12px', color: '#555', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderBottom: msg.forecast && msg.forecast.length > 0 ? '1px solid #eee' : 'none', paddingBottom: msg.forecast && msg.forecast.length > 0 ? '8px' : '0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {msg.location}</span>
                      <span style={{ width: '1px', height: '12px', background: '#ddd' }}></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🌡️ {msg.temp}</span>
                      <span style={{ width: '1px', height: '12px', background: '#ddd' }}></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>☁️ {msg.weather}</span>
                    </div>
                    {msg.forecast && msg.forecast.length > 0 && (
                      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingTop: '4px' }}>
                        {msg.forecast.map((day, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span style={{ fontSize: '16px', margin: '4px 0' }}>{day.description.includes('Rain') ? '🌧️' : day.description.includes('Cloud') ? '⛅' : '☀️'}</span>
                            <span style={{ fontSize: '10px' }}>{day.max_temp}°/{day.min_temp}°</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (msg.type === 'schedule') {
                return (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '16px', padding: '16px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    {msg.events.map((ev, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: i === msg.events.length - 1 ? '0' : '12px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', gap: '12px', color: '#111', fontWeight: '500' }}>
                          <span style={{ color: '#7c3aed' }}>📅</span>
                          <span><strong>{ev.date ? `${ev.date}, ` : ''}{ev.time}</strong> {ev.title}</span>
                        </div>
                        <div style={{ color: '#888' }}>{ev.desc}</div>
                      </div>
                    ))}
                  </div>
                );
              }
              if (msg.type === 'section-title') {
                return (
                  <div key={idx} style={{ fontSize: '14px', color: '#333', marginBottom: '12px', fontWeight: '500' }}>
                    {msg.text}
                  </div>
                );
              }
              if (msg.type === 'proposal') {
                return (
                  <div key={idx} className="proposal-card">
                    <div className="proposal-top-row">
                      <div className="proposal-items">
                        {msg.items && msg.items.length > 0 ? (
                          msg.items.map((img, i) => <img key={i} src={img} alt="Item" />)
                        ) : (
                          <>
                            <img src="/custom-top.png" alt="Top" />
                            <img src="/custom-jeans.png" alt="Jeans" />
                            <img src="/custom-shoe.png" alt="Shoes" />
                          </>
                        )}
                      </div>
                      <div className="proposal-info">
                        <div className="proposal-info-header">
                          <h4>{msg.title}</h4>
                          <span className="proposal-badge" style={{ background: msg.badgeColor || '#f3e8ff' }}>{msg.badge}</span>
                        </div>
                        <p className="proposal-desc">
                          {msg.desc}
                        </p>
                      </div>
                    </div>
                    <div className="proposal-actions">
                      <button className="premium-btn-primary" onClick={() => {
                        const isChikankari = msg.title.toLowerCase().includes('chikankari') || msg.items?.some(i => typeof i === 'string' && i.includes('chickenkari'));

                        if (isChikankari) {
                          setSelectedLocalPose("/pose1 (3).png");
                          const chikankariItem = { id: 99, name: "Chikankari Kurti", image: "/chickenkari_top.png", category: "Tops" };
                          setWornItems([chikankariItem]);
                          setIsGeneratingVton(true);
                          setTimeout(() => {
                            setVtonResultImage('/chcikenkurtamodel.jpeg');
                            setIsGeneratingVton(false);
                          }, 8000);
                          return;
                        }

                        const top = wardrobeItems.find(i => i.id === 1);
                        const jeans = wardrobeItems.find(i => i.id === 2);
                        const glasses = wardrobeItems.find(i => i.id === 3);
                        const shoes = wardrobeItems.find(i => i.id === 4);

                        setSelectedLocalPose("/pose1 (3).png");
                        setWornItems([top, jeans, glasses, shoes]);
                        setIsGeneratingVton(true);
                        setTimeout(() => {
                          setVtonResultImage('/top_jeans_glass_shoes.png');
                          setIsGeneratingVton(false);
                        }, 1500);
                      }}>👕 Try on</button>
                      <button className="premium-btn-secondary" onClick={() => setExpandedAgents(prev => ({ ...prev, [msg.title]: !prev[msg.title] }))}>
                        💬 Agent
                      </button>
                    </div>
                    {expandedAgents[msg.title] && (
                      <div className="proposal-agents" style={{ background: '#f8f8f8', padding: '12px', borderRadius: '12px', marginTop: '12px', fontSize: '12px', border: '1px solid #eee' }}>
                        <div style={{ marginBottom: '8px' }}><strong>✧ Style Agent:</strong> {msg.style_agent || `Perfect mix of cultural vibe and comfort for the ${msg.title ? msg.title.split('•')[0] : 'event'}!`}</div>
                        <div style={{ color: '#7c3aed' }}><strong>🛍 Finance Agent:</strong> {msg.finance_agent || 'Found a similar premium style on Myntra for 30% less! A smart financial choice.'}</div>
                      </div>
                    )}
                  </div>
                );
              }
              if (msg.type === 'cultural-event') {
                return (
                  <div key={idx} style={{ background: '#f4f5fd', borderRadius: '24px', padding: '24px', marginBottom: '24px', border: '1px solid #eef0fa' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '20px' }}>🎉</span>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#111' }}>{msg.title}</h3>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{msg.time}</div>
                        <p style={{ margin: '0', fontSize: '13px', color: '#444', lineHeight: '1.4' }}>{msg.desc}</p>
                      </div>
                    </div>

                    {msg.looks.map((look, i) => (
                      <div key={i} className="proposal-card">
                        <div className="proposal-top-row">
                          <div className="proposal-items">
                            {look.items && look.items.length > 0 ? (
                              look.items.map((img, i) => <img key={i} src={img} alt="Item" />)
                            ) : (
                              <>
                                <img src="/custom-top.png" alt="Top" />
                                <img src="/custom-jeans.png" alt="Jeans" />
                                <img src="/custom-shoe.png" alt="Shoes" />
                              </>
                            )}
                          </div>
                          <div className="proposal-info">
                            <div className="proposal-info-header">
                              <h4>{look.title}</h4>
                              <span className="proposal-badge">{look.badge}</span>
                            </div>
                            <p className="proposal-desc">{look.desc}</p>
                          </div>
                        </div>
                        <div className="proposal-actions">
                          <button className="premium-btn-primary" onClick={() => { }}>👕 Try on</button>
                          <button className="premium-btn-secondary" onClick={() => setExpandedAgents(prev => ({ ...prev, [look.title]: !prev[look.title] }))}>
                            💬 Agent
                          </button>
                        </div>
                        {expandedAgents[look.title] && (
                          <div className="proposal-agents" style={{ background: '#f8f8f8', padding: '12px', borderRadius: '12px', marginTop: '12px', fontSize: '12px', border: '1px solid #eee' }}>
                            <div style={{ marginBottom: '8px' }}><strong>✧ Style Agent:</strong> {look.style_agent || `Perfect mix of cultural vibe and comfort for the ${look.title ? look.title.split('•')[0] : 'event'}!`}</div>
                            <div style={{ color: '#7c3aed' }}><strong>🛍 Finance Agent:</strong> {look.finance_agent || 'Found a similar premium style on Myntra for 30% less! A smart financial choice.'}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }

              if (msg.type === 'alert') {
                return (
                  <div key={idx} className="before-you-buy-card">
                    <div className="before-you-buy-header">
                      <span style={{ fontSize: '14px' }}>🛍️</span> BEFORE YOU BUY
                    </div>
                    <p>{msg.text}</p>
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
                    <button className="premium-btn-secondary full-width" style={{ background: '#fff4e6', color: '#e67700', borderColor: 'transparent', fontSize: 12 }}>Sync Catalog to {msg.location || currentLocation}</button>
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
                  {msg.type !== 'user' && <div className="message-sender" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>{msg.sender}</div>}
                  {msg.type === 'user' && <div className="message-sender" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#111', marginBottom: 4, textAlign: 'right' }}>{msg.sender}</div>}
                  <p style={{ background: msg.type === 'user' ? '#f5f5f5' : 'transparent', padding: msg.type === 'user' ? '12px 16px' : 0, borderRadius: msg.type === 'user' ? '16px 16px 0 16px' : 0, marginLeft: msg.type === 'user' ? 'auto' : 0, display: 'inline-block', maxWidth: '90%' }}>
                    {msg.text}
                  </p>
                </div>
              );
            })}

            {isTyping && (
              <div className="chat-message agent-msg">
                <p style={{ color: '#888', fontStyle: 'italic' }}>The Crew is typing...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <div className="suggestion-chips">
              <span onClick={() => setInputText("Style me for office")}>Style me for office</span>
              <span onClick={() => setInputText("Mujhe meri beti ke liye lehenga dekhna hai")}>Mujhe meri beti ke liye lehenga dekhna hai</span>
              <span onClick={() => setInputText("I need something for a cultural event")}>Shopping for a cultural event</span>
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-box">
              <span style={{ display: 'flex', alignItems: 'center', marginRight: '10px', color: '#888' }}>✨</span>
              <input
                type="text"
                placeholder="Ask, or name a city..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
              />
              <button type="submit" className="send-btn" disabled={!inputText.trim() || isTyping}>
                {isTyping ? '...' : '↑'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showSquadModal && (
        <div className="squad-select-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="squad-select-modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>Select Group to share getup with</h3>
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

