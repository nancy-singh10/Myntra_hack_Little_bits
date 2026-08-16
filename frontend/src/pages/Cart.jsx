import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateSquadModal from '../components/CreateSquadModal/CreateSquadModal';
import SquadSwipeGame from '../components/SquadSwipeGame/SquadSwipeGame';
import SquadSelector from '../components/SquadSelector/SquadSelector';
import './Cart.css';

const Cart = ({
  cartItems,
  setCartItems,
  squads,
  setSquads,
  activeSquadId,
  setActiveSquadId
}) => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const currentUser = searchParams.get('user') || 'You';
  const joinSquadId = searchParams.get('join_squad');

  const [isSplitBagActive, setIsSplitBagActive] = React.useState(!!joinSquadId);
  const [isPollActive, setIsPollActive] = React.useState(false);
  const [isGameActive, setIsGameActive] = React.useState(false);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showSelector, setShowSelector] = React.useState(true);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);

  const currentSquad = squads.find(s => s.id === activeSquadId) || null;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isSplitBagActive && currentSquad) {
        const ws = new WebSocket(`ws://localhost:8000/ws/squad/${currentSquad.id}/`);
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WS MESSAGE RECEIVED:", data);
            if (data.action === 'emoji_received') {
                const newEmoji = {
                    id: Date.now() + Math.random(),
                    char: data.emoji,
                    startX: window.innerWidth / 2, // Default fallback if no rect
                    startY: window.innerHeight / 2,
                    randomX: (Math.random() - 0.5) * 80,
                };
                setFloatingEmojis(prev => [...prev, newEmoji]);
                setTimeout(() => {
                    setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
                }, 2000);
            } else if (data.action === 'comment_received') {
                setItemComments(prev => {
                    const existing = prev[data.item_id] || [];
                    if (existing.some(c => c.id === data.comment_id)) return prev;
                    return {
                        ...prev,
                        [data.item_id]: [...existing, { id: data.comment_id, user: data.user, text: data.comment, isVoiceNote: false }]
                    };
                });
            } else if (data.action === 'user_joined') {
                if (data.user !== currentUser) {
                   setSquads(prev => prev.map(s => {
                       if (s.id === currentSquad.id && !s.members.includes(data.user)) {
                           return { ...s, members: [...s.members, data.user] };
                       }
                       return s;
                   }));
                }
            }
        };

        setSocket(ws);

        if (String(joinSquadId) === String(currentSquad.id) && currentUser !== 'You') {
            ws.onopen = () => {
                ws.send(JSON.stringify({
                    action: 'join_squad',
                    user: currentUser
                }));
            };
            setSquads(prev => prev.map(s => {
                if (s.id === currentSquad.id && !s.members.includes(currentUser)) {
                    return { ...s, members: [...s.members, currentUser] };
                }
                return s;
            }));
            setShowSelector(false);
        }
        return () => ws.close();
    }
  }, [isSplitBagActive, currentSquad]);

  const [itemVotes, setItemVotes] = React.useState({ 'neha_mock_1': 2, 'ananya_mock_1': 1 }); // Pre-filled votes for demo
  const [userVotes, setUserVotes] = React.useState({});
  const [floatingEmojis, setFloatingEmojis] = React.useState([]);
  const [reactions, setReactions] = React.useState({});
  const [friendReactions, setFriendReactions] = React.useState({
    'neha_mock_1': [{ id: 1, user: 'Ananya', emoji: '😍' }],
    'ananya_mock_1': [{ id: 2, user: 'Neha', emoji: '🤔' }, { id: 3, user: 'Priya', emoji: '😍' }]
  });
  const [checkoutMode, setCheckoutMode] = React.useState('pay_all');
  const [isRecording, setIsRecording] = React.useState(null);
  const [itemComments, setItemComments] = React.useState({
    'neha_mock_1': [
      { id: 1, user: 'Neha', text: 'Yeh wedding ke liye perfect lag raha hai! Tumhe kaisa laga?', isVoiceNote: true }
    ],
    'ananya_mock_1': [
      { id: 2, user: 'Ananya', text: 'I love this pink one!', isVoiceNote: false },
      { id: 3, user: 'Neha', text: 'Yes, it suits you so much', isVoiceNote: true }
    ]
  });

  const [newCommentText, setNewCommentText] = useState({});

  const handleAddComment = (itemId) => {
    const text = newCommentText[itemId]?.trim();
    if (!text) return;

    const commentId = Date.now() + Math.random();
    
    setItemComments(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { id: commentId, user: currentUser, text, isVoiceNote: false }]
    }));

    if (currentSquad && typeof currentSquad.id === 'number') {
        fetch(`https://myntra-hack-little-bits.onrender.com/squads/${currentSquad.id}/comments/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item: itemId, user: currentUser, text })
        }).catch(err => console.error("Could not save comment", err));
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            action: 'send_comment',
            item_id: itemId,
            comment_id: commentId,
            comment: text,
            user: currentUser
        }));
    }

    setNewCommentText(prev => ({ ...prev, [itemId]: '' }));
  };

  const handleCreateSquad = async (newSquadData) => {
    try {
        const res = await fetch('https://myntra-hack-little-bits.onrender.com/squads/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newSquadData.name,
                description: newSquadData.description,
                created_by: currentUser,
                members: [currentUser]
            })
        });
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend returned error:", res.status, errorText);
            alert("Error creating squad: " + errorText);
            return;
        }
        
        const savedSquad = await res.json();
        
        const newSquad = {
          id: savedSquad.id,
          icon: '🛍️',
          itemCount: 0,
          totalAmount: 0,
          name: savedSquad.name,
          description: savedSquad.description,
          members: savedSquad.members
        };
        setSquads(prev => [...prev, newSquad]);
        setActiveSquadId(newSquad.id);
        setShowCreateModal(false);
        setShowSelector(false);
    } catch (err) {
        console.error("Failed to save squad", err);
    }
  };

  const handleDeleteSquad = async (squadId) => {
    if (!window.confirm("Are you sure you want to delete this squad? This action cannot be undone.")) return;
    
    try {
        const res = await fetch(`https://myntra-hack-little-bits.onrender.com/squads/${squadId}/`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            setSquads(prev => prev.filter(s => s.id !== squadId));
            setActiveSquadId(null);
            setShowSelector(true);
        } else {
            alert("Failed to delete squad.");
        }
    } catch (err) {
        console.error("Error deleting squad", err);
    }
  };

  const handleSelectSquad = (id) => {
    setActiveSquadId(id);
    setShowSelector(false);
  };

  const handleFinishGame = ({ userLikes, mutualMatches }) => {
    if (userLikes && userLikes.length > 0) {
      setCartItems(prev => {
        let newItems = [...prev];
        userLikes.forEach(match => {
          const isMutual = match.likedByFriends && match.likedByFriends.length > 0;
          const addedByStr = isMutual ? `Liked by both` : `Liked by ${currentUser}`;
          
          if (!newItems.some(i => i.id === match.id || i.id === `${match.id}_shared` || i.id === `match_${match.id}`)) {
            newItems.push({
              id: `match_${match.id}`,
              brand: match.brand,
              title: match.title,
              imageUrl: match.imageUrl,
              price: match.price,
              originalPrice: match.originalPrice,
              discount: match.discount,
              size: 'M',
              color: 'Default',
              quantity: 1,
              isShared: true,
              addedBy: addedByStr
            });
          }
        });
        return newItems;
      });
    }
  };

  const handleVoiceNoteReal = (itemId) => {
    setIsRecording(itemId);
    setTimeout(() => {
      setItemComments(prev => ({
        ...prev,
        [itemId]: [...(prev[itemId] || []), { id: Date.now(), user: 'You', text: 'Mujhe yeh bahut pasand aaya!', isVoiceNote: true }]
      }));
      setIsRecording(null);
    }, 2500);
  };

  const handleAISummary = (itemId) => {
    setItemComments(prev => {
      const existing = prev[itemId] || [];
      if (existing.some(c => c.isAI)) return prev;

      const combinedText = existing.map(c => c.text.toLowerCase()).join(' ');
      const hindiKeywords = ['kaisa', 'rahega', 'hai', 'accha', 'mast', 'bhai', 'yaar', 'yeh', 'pasand'];
      const hasHindi = hindiKeywords.some(kw => combinedText.includes(kw));

      let aiText = "";
      if (hasHindi) {
        aiText = itemId === 'ananya_mock_1'
          ? "Aapke dono friends ko yeh choice pasand aayi! Myntra par iski 4.2 star rating hai. Shaadi ke functions ke liye perfect fit hai!"
          : "Is item par reviews bahut acche hain. Trendy aur comfortable dono hai!";
      } else {
        aiText = itemId === 'ananya_mock_1'
          ? "Both of your friends love this choice! It has a 4.2 star rating on Myntra. Perfect fit for wedding functions!"
          : "The reviews on this item are great. It's both trendy and comfortable!";
      }

      return {
        ...prev,
        [itemId]: [...existing, { id: Date.now(), user: '✨ AI Stylist', text: aiText, isAI: true }]
      };
    });
  };

  const handlePlayAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("TTS simulated: " + text);
    }
  };

  const handleRemoveComment = (itemId, commentId) => {
    setItemComments(prev => {
      const existing = prev[itemId] || [];
      return {
        ...prev,
        [itemId]: existing.filter(c => c.id !== commentId)
      };
    });
  };

  const handleReaction = (itemId, emoji, event) => {
    setReactions(prev => ({ ...prev, [itemId]: prev[itemId] === emoji ? null : emoji }));

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            action: 'send_emoji',
            item_id: itemId,
            emoji: emoji,
            user: currentUser
        }));
    }

    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const newEmoji = {
        id: Date.now() + Math.random(),
        char: emoji,
        startX: rect.left + rect.width / 2,
        startY: rect.top,
        randomX: (Math.random() - 0.5) * 80,
      };

      setFloatingEmojis(prev => [...prev, newEmoji]);

      setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== newEmoji.id));
      }, 2000);
    }
  };

  const nehaMockItem = {
    id: 'neha_mock_1',
    brand: 'anayna',
    title: 'Women Printed Kurta with Trousers',
    imageUrl: '/kurti-3.png',
    price: 700,
    originalPrice: 5450,
    discount: '(87% OFF)',
    size: 'M',
    color: 'Blue',
    quantity: 1,
    isShared: true,
    addedBy: 'Neha'
  };

  const ananyaMockItem = {
    id: 'ananya_mock_1',
    brand: 'Sangria',
    title: 'Shoulder Strap Kurta Set',
    imageUrl: '/kurti-2.png',
    price: 993,
    originalPrice: 3999,
    discount: '(75% OFF)',
    size: 'M',
    color: 'Pink',
    quantity: 1,
    isShared: true,
    addedBy: 'Ananya'
  };

  const displayItems = isSplitBagActive
    ? [...cartItems.filter(item => item.isShared), nehaMockItem, ananyaMockItem]
    : cartItems.filter(item => !item.isShared);

  const totalMRP = displayItems.reduce((acc, item) => acc + (item.originalPrice * item.quantity), 0);
  const totalDiscount = displayItems.reduce((acc, item) => acc + ((item.originalPrice - item.price) * item.quantity), 0);
  const totalAmount = totalMRP - totalDiscount;

  const maxVotes = Math.max(0, ...Object.values(itemVotes));
  const totalVotes = Object.values(itemVotes).reduce((a, b) => a + b, 0);

  const splitBreakdown = displayItems.reduce((acc, item) => {
    const person = item.addedBy || 'You';
    const itemTotal = item.price * item.quantity;
    acc[person] = (acc[person] || 0) + itemTotal;
    return acc;
  }, {});

  const handleQuantity = (id, delta) => {
    if (id === 'neha_mock_1' || id === 'ananya_mock_1') return;
    setCartItems(items => items.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
      }
      return item;
    }));
  };

  const handleRemove = (id) => {
    if (id === 'neha_mock_1' || id === 'ananya_mock_1') return;
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const handleVote = (id) => {
    if (userVotes[id]) {
      setItemVotes(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) - 1) }));
      setUserVotes(prev => ({ ...prev, [id]: false }));
    } else {
      setItemVotes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
      setUserVotes(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleMoveToSplitBag = (id) => {
    if (squads && squads.length > 0) {
      setItemToMove(id);
      setShowSquadModal(true);
    } else {
      executeMoveToSplitBag(id);
    }
  };

  const executeMoveToSplitBag = (id) => {
    setCartItems(items => {
      const itemToCopy = items.find(item => item.id === id);
      if (!itemToCopy) return items;

      const alreadyShared = items.some(item => item.id === `${id}_shared`);
      if (alreadyShared) return items;

      const sharedCopy = { ...itemToCopy, id: `${id}_shared`, isShared: true };
      return [...items, sharedCopy];
    });
  };

  React.useEffect(() => {
    const handleVoiceCommand = (e) => {
      const { action } = e.detail;
      if (action === 'place-order' && cartItems.length > 0) {
        navigate('/address', { state: { displayItems, totalMRP, totalDiscount, totalAmount, checkoutMode, splitBreakdown } });
      }
    };

    window.addEventListener('voice-command', handleVoiceCommand);
    return () => window.removeEventListener('voice-command', handleVoiceCommand);
  }, [cartItems.length, navigate]);

  return (
    <div className="cart-container">
      {/* Squad Swipe Game Modal */}
      {isGameActive && (
        <SquadSwipeGame
          squadName={currentSquad?.name || "Ananya's Bday Squad"}
          onClose={() => setIsGameActive(false)}
          onFinishGame={handleFinishGame}
        />
      )}

      {/* Main Cart Content */}
      <div className="cart-content">
        <div className="cart-left">
          <div className="cart-header">
            <h3>{isSplitBagActive ? 'Shared Cart' : 'My Bag'} {displayItems.length > 0 && `(${displayItems.length} item${displayItems.length > 1 ? 's' : ''})`}</h3>

            <div className="bag-toggle-container">
              <button
                className={`bag-toggle-btn ${!isSplitBagActive ? 'active' : ''}`}
                onClick={() => setIsSplitBagActive(false)}
              >
                My Bag
              </button>
              <button
                className={`bag-toggle-btn ${isSplitBagActive ? 'active' : ''}`}
                onClick={() => setIsSplitBagActive(true)}
              >
                Shared Cart
              </button>
            </div>

            {isSplitBagActive && currentSquad && !showSelector && !showCreateModal && (
              <div className="squad-actions-group">
                <button
                  className={`squad-poll-btn ${isPollActive ? 'active' : ''}`}
                  onClick={() => setIsPollActive(!isPollActive)}
                >
                  📊 {isPollActive ? 'End Poll' : 'Poll'}
                </button>
                <button className="whatsapp-invite-btn" onClick={() => {
                  const inviteUrl = `${window.location.origin}/cart?join_squad=${currentSquad.id}&user=Seeta`;
                  navigator.clipboard.writeText(inviteUrl);
                  alert(`Invite link copied to clipboard!\nWe'll also open this link in a new tab for you to easily test it!`);
                  window.open(inviteUrl, '_blank');
                }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="wa-icon" />
                  Invite
                </button>
                <button className="squad-game-btn" onClick={() => setIsGameActive(true)}>
                  <span className="game-cards-icon">🎴</span>
                  Game
                </button>
              </div>
            )}
          </div>

          {/* Conditional Views for Split Bag */}
          {isSplitBagActive && showCreateModal ? (
            <CreateSquadModal
              onCreateSquad={handleCreateSquad}
              onCancel={() => setShowCreateModal(false)}
            />
          ) : isSplitBagActive && (showSelector || !currentSquad) ? (
            <SquadSelector
              squads={squads}
              onSelectSquad={handleSelectSquad}
              onCreateNewSquad={() => setShowCreateModal(true)}
            />
          ) : (
            <>
              {isSplitBagActive && currentSquad && (
                <div className="squad-banner-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="squad-banner-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button className="back-squads-btn" onClick={() => setShowSelector(true)} style={{
                        background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem'
                      }}>
                        ← All Groups
                      </button>
                      <span className="squad-banner-badge" style={{ fontSize: '0.7rem', background: '#ff3f6c', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ACTIVE SQUAD</span>
                    </div>
                    <h4 className="squad-banner-title" style={{ margin: '8px 0 4px 0', fontSize: '1.2rem' }}>{currentSquad.name}</h4>
                    {currentSquad.description && <p className="squad-banner-desc" style={{ margin: '0 0 10px 0', color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>"{currentSquad.description}"</p>}
                    <div className="squad-members-avatars">
                      {currentSquad.members?.map((m, idx) => (
                        <span key={idx} className="member-avatar" title={m}>{m[0]}</span>
                      ))}
                      <span className="add-member-pill" onClick={() => {
                        const inviteUrl = `${window.location.origin}/cart?join_squad=${currentSquad.id}&user=Seeta`;
                        navigator.clipboard.writeText(inviteUrl);
                        alert(`Invite link copied to clipboard!\nOpen this link in a new incognito window to join as Seeta.`);
                      }}>+ Add</span>
                    </div>
                  </div>
                  
                  <div className="squad-banner-right">
                    <button className="delete-squad-btn" onClick={() => handleDeleteSquad(currentSquad.id)} style={{
                        background: 'transparent',
                        border: '1px solid #ff4d4f',
                        color: '#ff4d4f',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}>
                      🗑️ Delete Squad
                    </button>
                  </div>
                </div>
              )}

          {isSplitBagActive && (
            <div className="gamified-savings">
              <div className="savings-text">Add ₹{Math.max(0, 1000 - totalAmount)} more together to unlock <strong>Free Delivery!</strong></div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (totalAmount / 1000) * 100)}%` }}></div>
              </div>
              <div className="savings-text" style={{ marginTop: '10px' }}>Add ₹{Math.max(0, 2000 - totalAmount)} more together to get <strong>₹300 OFF!</strong></div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, (totalAmount / 2000) * 100)}%`, backgroundColor: '#ff905a' }}></div>
              </div>
            </div>
          )}

          <div className="cart-items">
            {displayItems.map(item => (
              <div key={item.id} className="cart-item" style={{ flexDirection: 'column' }}>
                <div className="cart-item-top" style={{ display: 'flex', width: '100%' }}>
                  <img src={item.imageUrl} alt={item.title} className="cart-item-image" style={{ objectFit: 'contain', objectPosition: 'center', background: '#f5f5f5' }} />
                  <div className="cart-item-details">
                    {isSplitBagActive && (
                      <div className={`user-tag ${item.addedBy === currentUser || item.addedBy?.startsWith('Liked by You') ? 'tag-you' : 'tag-friend'}`}>
                        {(item.addedBy || 'Added by You').toUpperCase()}
                      </div>
                    )}
                    <div className="cart-item-brand">{item.brand}</div>
                    <div className="cart-item-title">{item.title}</div>
                    <div className="cart-item-attributes">
                      <span className="attr-pill">Size: {item.size}</span>
                      <span className="attr-pill">Color: {item.color}</span>
                    </div>
                    <div className="cart-item-price-row">
                      <span className="cart-current-price">₹{item.price}</span>
                      <span className="cart-original-price">₹{item.originalPrice}</span>
                      <span className="cart-discount">{item.discount}</span>
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    {isSplitBagActive && isPollActive && (
                      <div className="poll-ui-container">
                        <button
                          className={`vote-btn ${userVotes[item.id] ? 'voted' : ''}`}
                          onClick={() => handleVote(item.id)}
                        >
                          {userVotes[item.id] ? '✅ VOTED' : '🔥 VOTE FOR THIS'}
                        </button>
                        <div className="vote-stats">
                          <div className="vote-bar-bg">
                            <div className="vote-bar-fill" style={{ width: `${((itemVotes[item.id] || 0) / (totalVotes || 1)) * 100}%` }}></div>
                          </div>
                          <span className="vote-count">{itemVotes[item.id] || 0} Votes</span>
                        </div>
                        {itemVotes[item.id] === maxVotes && maxVotes > 0 && (
                          <div className="winning-badge">🏆 Squad Favorite! 5% Extra Off</div>
                        )}
                      </div>
                    )}
                    {isSplitBagActive && !isPollActive && (
                      <div className="reactions-container">
                        <div className="reaction-bar">
                          <button className={`reaction-btn ${reactions[item.id] === '😍' ? 'active' : ''}`} onClick={(e) => handleReaction(item.id, '😍', e)}>😍</button>
                          <button className={`reaction-btn ${reactions[item.id] === '🤔' ? 'active' : ''}`} onClick={(e) => handleReaction(item.id, '🤔', e)}>🤔</button>
                          <button className={`reaction-btn ${reactions[item.id] === '👎' ? 'active' : ''}`} onClick={(e) => handleReaction(item.id, '👎', e)}>👎</button>
                          <button
                            className={`voice-note-btn ${isRecording === item.id ? 'recording' : ''}`}
                            onClick={() => handleVoiceNoteReal(item.id)}
                            title="Record Voice Note"
                          >
                            {isRecording === item.id ? '🔴' : '🎙️'}
                          </button>
                          <button className="voice-note-btn ai-btn" onClick={() => handleAISummary(item.id)} title="Ask AI Stylist" style={{ background: '#f0f0ff' }}>✨</button>
                        </div>

                        {(friendReactions[item.id] || reactions[item.id]) && (
                          <div className="friends-reactions-display">
                            {friendReactions[item.id]?.map(fr => (
                              <span key={fr.id} className="friend-reaction-pill" title={`${fr.user} reacted`}>
                                {fr.emoji} <span className="friend-name">{fr.user}</span>
                              </span>
                            ))}
                            {reactions[item.id] && (
                              <span className="friend-reaction-pill yours" title="You reacted">
                                {reactions[item.id]} <span className="friend-name">You</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {!isSplitBagActive && (
                      <button className="move-to-split-btn" onClick={() => handleMoveToSplitBag(item.id)}>
                        <span>🤝</span> Move to Shared Cart
                      </button>
                    )}
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleQuantity(item.id, 1)}>+</button>
                    </div>
                    <button className="remove-btn" onClick={() => handleRemove(item.id)}>Remove</button>
                  </div>
                </div>
                {isSplitBagActive && (
                  <div className="item-comments-section">
                    {(itemComments[item.id] || []).map(comment => (
                      <div key={comment.id} className={`comment-bubble ${comment.isAI ? 'comment-ai' : comment.user === currentUser ? 'comment-yours' : 'comment-theirs'}`}>
                        <div className="comment-author">{comment.user === currentUser ? 'You' : comment.user}</div>
                        <div className="comment-text">
                          {comment.isVoiceNote && <span className="voice-icon">🎙️</span>}
                          {comment.text}
                          <button className="play-tts-btn" onClick={() => handlePlayAudio(comment.text)} title="Read Aloud">▶️</button>
                        </div>
                        {comment.user === currentUser && (
                          <button
                            className="delete-comment-btn"
                            onClick={() => handleRemoveComment(item.id, comment.id)}
                            title="Delete this comment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Inline Typable Comment & Voice Message Input Box */}
                    <div className="add-comment-input-row">
                      <input
                        type="text"
                        className="comment-text-input"
                        placeholder="Type a comment or record a voice note..."
                        value={newCommentText[item.id] || ''}
                        onChange={(e) => setNewCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(item.id);
                        }}
                      />
                      <button
                        className={`voice-comment-btn ${isRecording === item.id ? 'recording' : ''}`}
                        onClick={() => handleVoiceNoteReal(item.id)}
                        title="Send Voice Message"
                      >
                        {isRecording === item.id ? '🔴 Recording...' : '🎙️ Voice'}
                      </button>
                      <button className="send-comment-btn" onClick={() => handleAddComment(item.id)}>
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {displayItems.length === 0 && (
              <div className="empty-cart">
                <p>Your cart is empty!</p>
                <button onClick={() => navigate('/women')} className="continue-shopping">CONTINUE SHOPPING</button>
              </div>
            )}
          </div>
          </>
          )}
        </div>

        {(!isSplitBagActive || (isSplitBagActive && !showCreateModal && !showSelector && currentSquad)) && (
        <div className="cart-right">
          <div className="price-details-card">
            <h4 className="price-header">PRICE DETAILS ({displayItems.length} Items)</h4>

            <div className="price-row">
              <span>Total MRP</span>
              <span>₹{totalMRP}</span>
            </div>
            <div className="price-row">
              <span>Discount on MRP</span>
              <span className="discount-value">-₹{totalDiscount}</span>
            </div>
            <div className="price-row">
              <span>Platform Fee</span>
              <span>FREE</span>
            </div>
            <div className="price-row">
              <span>Shipping Fee</span>
              <span className="discount-value">FREE</span>
            </div>

            <hr className="price-divider" />

            <div className="price-row total-row">
              <span>Total Amount</span>
              <span>₹{totalAmount}</span>
            </div>

            {isSplitBagActive && (
              <div className="checkout-mode-selector">
                <p className="checkout-mode-title">Who is paying?</p>
                <div className="checkout-options-container">
                  <label className={`checkout-option ${checkoutMode === 'split' ? 'selected' : ''}`}>
                    <input type="radio" name="checkoutMode" checked={checkoutMode === 'split'} onChange={() => setCheckoutMode('split')} />
                    <span>Split the Bill</span>
                  </label>
                  {checkoutMode === 'split' && (
                    <div className="split-breakdown">
                      {Object.entries(splitBreakdown).map(([person, amount]) => (
                        <div key={person} className="split-person-row">
                          <span className="split-person-name">{person} pays:</span>
                          <span className="split-person-amount">₹{amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className={`checkout-option ${checkoutMode === 'pay_all' ? 'selected' : ''}`}>
                    <input type="radio" name="checkoutMode" checked={checkoutMode === 'pay_all'} onChange={() => setCheckoutMode('pay_all')} />
                    <span>Pay for Entire Bag</span>
                  </label>
                </div>
              </div>
            )}



            <button
              className="place-order-btn"
              onClick={() => navigate('/address', { state: { displayItems, totalMRP, totalDiscount, totalAmount, checkoutMode, splitBreakdown } })}
              disabled={displayItems.length === 0}
            >
              PLACE ORDER
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Floating Emojis Container */}
      {floatingEmojis.map(emoji => (
        <div
          key={emoji.id}
          className="floating-emoji"
          style={{
            left: emoji.startX + 'px',
            top: emoji.startY + 'px',
            '--drift': emoji.randomX + 'px'
          }}
        >
          {emoji.char}
        </div>
      ))}

      {showSquadModal && (
        <div className="squad-select-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="squad-select-modal-content" style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Select Squad to add to</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {squads.map(squad => (
                <button 
                  key={squad.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', border: '1px solid #eee', borderRadius: '8px', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => {
                    setActiveSquadId(squad.id);
                    executeMoveToSplitBag(itemToMove);
                    setShowSquadModal(false);
                    setItemToMove(null);
                    setIsSplitBagActive(true);
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
              onClick={() => { setShowSquadModal(false); setItemToMove(null); }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;
