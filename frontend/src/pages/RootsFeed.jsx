import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Sparkles, MapPin } from 'lucide-react';
import './RootsFeed.css';

const RootsFeed = () => {
  const navigate = useNavigate();
  const [activeAI, setActiveAI] = useState({});
  const [likedPosts, setLikedPosts] = useState({});

  const toggleLike = (uniqueId) => {
    setLikedPosts(prev => ({ ...prev, [uniqueId]: !prev[uniqueId] }));
  };

  const mockFeedData = [
    {
      id: 1,
      artisan: "Rahul Weavers",
      location: "Varanasi, UP",
      videoUrl: "/video-1.mp4",
      description: "Handweaving the finest Banarasi silk. Every thread tells a story of our heritage. #MyRoots #Varanasi",
      aiResponse: "Pair this beautiful Banarasi saree with a contrasting emerald green blouse and traditional Kundan jewelry for a perfect wedding look!",
      product: {
        id: 'roots_1',
        name: "Authentic Banarasi Silk Saree",
        price: "₹3,499",
        image: "/saree-ban.jpeg"
      }
    },
    {
      id: 2,
      artisan: "Anita's Craft",
      location: "Jaipur, RJ",
      videoUrl: "/video-2.mp4",
      description: "Block printing the traditional way! Wait till the end to see the final pattern 😍 #BlockPrint #Jaipur",
      aiResponse: "Style this hand-block print kurti with oxidized silver jhumkas and comfortable palazzos for a breezy daytime event!",
      product: {
        id: 'roots_2',
        name: "Hand-Block Print Kurti",
        price: "₹1,899",
        image: "/saree-blocl.jpg"
      }
    },
    {
      id: 3,
      artisan: "Kutch Collective",
      location: "Bhuj, GJ",
      videoUrl: "/video-3.mp4",
      description: "Intricate mirror work done entirely by hand. Supporting local women artisans. #KutchWork #Handmade",
      aiResponse: "Complement this intricate mirror work jacket with a simple solid kurta underneath and traditional mojari footwear!",
      product: {
        id: 'roots_3',
        name: "Mirror Work Ethnic Jacket",
        price: "₹2,299",
        image: "/saree-mirror.webp"
      }
    }
  ];

  const [feedPosts, setFeedPosts] = useState(() => 
    mockFeedData.map(post => ({ ...post, uniqueId: Math.random().toString() }))
  );
  const videoRefs = useRef([]);

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      setFeedPosts(prev => [
        ...prev,
        ...mockFeedData.map(post => ({ ...post, uniqueId: Math.random().toString() }))
      ]);
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(err => console.log("Play error", err));
        } else {
          entry.target.pause();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => {
      observer.disconnect();
    };
  }, [feedPosts]);

  return (
    <div className="roots-feed-container">
      <div className="roots-feed-header">
        <h1>Bharat Loom <Sparkles size={20} color="#ff3f6c"/></h1>
        <p>Discover India's finest artisans</p>
      </div>

      <div className="feed-scroll-container" onScroll={handleScroll}>
        {feedPosts.map((post, index) => (
          <div key={post.uniqueId} className="feed-post">
            <video 
              ref={el => videoRefs.current[index] = el}
              className="post-video" 
              loop 
              muted 
              playsInline
              src={post.videoUrl}
            />
            
            <div className="post-overlay">
              <div className="post-header-info">
                <h3>{post.artisan}</h3>
                <span className="location-tag"><MapPin size={12} /> {post.location}</span>
              </div>
              
              <div className="post-actions-right">
                <div className="action-btn" onClick={() => toggleLike(post.uniqueId)}>
                  <Heart 
                    size={28} 
                    fill={likedPosts[post.uniqueId] ? "#ff3f6c" : "transparent"} 
                    color={likedPosts[post.uniqueId] ? "#ff3f6c" : "currentColor"} 
                  />
                  <span>{likedPosts[post.uniqueId] ? "12.1k" : "12k"}</span>
                </div>
                <div className="action-btn">
                  <MessageCircle size={28} />
                  <span>458</span>
                </div>
                <div className="action-btn">
                  <Share2 size={28} />
                  <span>Share</span>
                </div>
              </div>

              <div className="post-bottom-info">
                <p className="post-desc">{post.description}</p>
                
                <div className="ai-stylist-prompt" onClick={() => setActiveAI(prev => ({ ...prev, [post.uniqueId]: !prev[post.uniqueId] }))}>
                  <Sparkles size={16} />
                  <span>Style this for a local wedding</span>
                </div>

                {activeAI[post.uniqueId] && (
                  <div className="ai-stylist-response">
                    <p><strong>AI Stylist ✨:</strong> {post.aiResponse} <br/><br/><em>Would you like to see jewelry recommendations?</em></p>
                  </div>
                )}

                <div 
                  className="shoppable-card"
                  onClick={() => navigate(`/roots/product/${post.product.id}`)}
                >
                  <img src={post.product.image} alt="Product" className="shoppable-img" />
                  <div className="shoppable-details">
                    <h4>{post.product.name}</h4>
                    <p>{post.product.price}</p>
                  </div>
                  <button className="buy-btn">View Drop</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RootsFeed;
