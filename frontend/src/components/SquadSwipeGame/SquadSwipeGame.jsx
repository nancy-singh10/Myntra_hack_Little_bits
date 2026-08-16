import React, { useState } from 'react';
import './SquadSwipeGame.css';

const gameProducts = [
  {
    id: 'game_1',
    brand: 'Sangria',
    title: 'Shoulder Strap Kurta Set with Dupatta',
    price: 993,
    originalPrice: 3999,
    discount: '75% OFF',
    rating: '4.2',
    imageUrl: '/kurti-2.png',
    category: 'Kurta Set',
    likedByFriends: ['Neha', 'Priya'],
    reason: "Ananya's Favorite Color: Pink 💕"
  },
  {
    id: 'game_2',
    brand: 'anayna',
    title: 'Women Printed Kurta with Trousers',
    price: 1645,
    originalPrice: 5450,
    discount: '70% OFF',
    rating: '4.4',
    imageUrl: '/kurti-3.png',
    category: 'Kurta Set',
    likedByFriends: ['Neha'],
    reason: 'Perfect for Bday Party 🎉'
  },
  {
    id: 'game_3',
    brand: 'Tikhi Imli',
    title: 'Ethnic Motifs Embroidered Saree',
    price: 1699,
    originalPrice: 6330,
    discount: '73% OFF',
    rating: '4.6',
    imageUrl: '/saree-2.png',
    category: 'Saree',
    likedByFriends: ['Priya', 'Rohan'],
    reason: 'Royal & Elegant Look ✨'
  },
  {
    id: 'game_4',
    brand: 'Varanga',
    title: 'Women Work Wear Straight Kurta',
    price: 1318,
    originalPrice: 6999,
    discount: '81% OFF',
    rating: '4.0',
    imageUrl: '/kurti-1.png',
    category: 'Kurta',
    likedByFriends: ['Neha'],
    reason: 'Top Rated on Myntra ⭐'
  },
  {
    id: 'game_5',
    brand: 'MAGNEITTA',
    title: 'Leheriya Pure Chiffon Saree',
    price: 617,
    originalPrice: 2199,
    discount: '72% OFF',
    rating: '4.1',
    imageUrl: '/saree-4.png',
    category: 'Saree',
    likedByFriends: ['Priya'],
    reason: 'Bestseller Pick 🛍️'
  }
];

const SquadSwipeGame = ({ squadName = "Ananya's Bday Squad", onClose, onFinishGame }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLikes, setUserLikes] = useState([]);
  const [userPasses, setUserPasses] = useState([]);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'
  const [isGameOver, setIsGameOver] = useState(false);

  const currentProduct = gameProducts[currentIndex];

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);

    setTimeout(() => {
      if (direction === 'right') {
        setUserLikes(prev => [...prev, currentProduct]);
      } else {
        setUserPasses(prev => [...prev, currentProduct]);
      }

      setSwipeDirection(null);
      setDragOffset(0);

      if (currentIndex + 1 < gameProducts.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsGameOver(true);
      }
    }, 250);
  };

  // Drag / Swipe Touch gesture handlers
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 90) {
      handleSwipe('right');
    } else if (dragOffset < -90) {
      handleSwipe('left');
    } else {
      setDragOffset(0);
    }
  };

  // Calculate mutual matches
  const mutualMatches = userLikes.filter(p => p.likedByFriends && p.likedByFriends.length > 0);

  const handleComplete = () => {
    if (onFinishGame) {
      onFinishGame({ userLikes, mutualMatches });
    }
    onClose();
  };

  return (
    <div className="swipe-game-overlay">
      <div className="swipe-game-modal">
        {/* Header */}
        <div className="swipe-game-header">
          <div className="swipe-game-title-group">
            <span className="game-icon">🎴</span>
            <div>
              <h3>Squad Swipe Game</h3>
              <p className="squad-tag">{squadName}</p>
            </div>
          </div>
          <button className="close-game-btn" onClick={onClose}>✕</button>
        </div>

        {!isGameOver ? (
          <div className="swipe-game-content">
            {/* Progress Bar */}
            <div className="swipe-progress-bar">
              <div
                className="swipe-progress-fill"
                style={{ width: `${((currentIndex + 1) / gameProducts.length) * 100}%` }}
              ></div>
            </div>
            <div className="swipe-count-label">
              Card {currentIndex + 1} of {gameProducts.length}
            </div>

            {/* Card Deck Container */}
            <div className="card-deck-container">
              {currentProduct && (
                <div
                  className={`swipe-card ${swipeDirection ? `swiping-${swipeDirection}` : ''}`}
                  style={{
                    transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.05}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.25s ease-out'
                  }}
                  onMouseDown={handleTouchStart}
                  onMouseMove={handleTouchMove}
                  onMouseUp={handleTouchEnd}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Swipe stamps overlay */}
                  {(dragOffset > 40 || swipeDirection === 'right') && (
                    <div className="stamp stamp-like">LIKE ❤️</div>
                  )}
                  {(dragOffset < -40 || swipeDirection === 'left') && (
                    <div className="stamp stamp-nope">PASS 👎</div>
                  )}

                  <div className="card-image-container">
                    <img src={currentProduct.imageUrl} alt={currentProduct.title} className="card-image" />
                    <div className="card-badge">{currentProduct.reason}</div>
                  </div>

                  <div className="card-info">
                    <div className="card-brand">{currentProduct.brand}</div>
                    <div className="card-title">{currentProduct.title}</div>

                    <div className="card-price-row">
                      <span className="card-price">₹{currentProduct.price}</span>
                      <span className="card-original-price">₹{currentProduct.originalPrice}</span>
                      <span className="card-discount">({currentProduct.discount})</span>
                    </div>

                    {currentProduct.likedByFriends.length > 0 && (
                      <div className="squad-friends-liked">
                        <span className="flame-icon">🔥</span>
                        <span>Already liked by <strong>{currentProduct.likedByFriends.join(', ')}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="swipe-actions">
              <button
                className="action-btn btn-pass"
                onClick={() => handleSwipe('left')}
                title="Pass (Swipe Left)"
              >
                👎
              </button>
              <button
                className="action-btn btn-superlike"
                onClick={() => handleSwipe('right')}
                title="Super Like"
              >
                ⭐
              </button>
              <button
                className="action-btn btn-like"
                onClick={() => handleSwipe('right')}
                title="Like (Swipe Right)"
              >
                ❤️
              </button>
            </div>
            <p className="swipe-tip-text">Drag card left/right or click buttons</p>
          </div>
        ) : (
          /* Game Summary Screen */
          <div className="swipe-summary-content">
            <div className="summary-banner">
              <span className="trophy-icon">🏆</span>
              <h2>Game Finished!</h2>
              <p>Here is what you & your squad loved</p>
            </div>

            {/* Mutual Matches Section */}
            <div className="summary-section">
              <h4 className="section-title">🔥 Squad Mutual Matches ({mutualMatches.length})</h4>
              <p className="section-desc">Products swiped right by both you and your squad friends!</p>
              
              <div className="matches-grid">
                {mutualMatches.map(item => (
                  <div key={item.id} className="match-card">
                    <img src={item.imageUrl} alt={item.title} className="match-img" />
                    <div className="match-details">
                      <span className="match-badge">🔥 Mutual Pick</span>
                      <div className="match-title">{item.title}</div>
                      <div className="match-friends">Matched with {item.likedByFriends.join(' & ')}</div>
                      <div className="match-price">₹{item.price}</div>
                    </div>
                  </div>
                ))}
                {mutualMatches.length === 0 && (
                  <div className="no-matches">No mutual matches yet! Try swiping more cards next time.</div>
                )}
              </div>
            </div>

            {/* Your Likes Section */}
            <div className="summary-section">
              <h4 className="section-title">❤️ Your Likes ({userLikes.length})</h4>
              <div className="user-likes-chips">
                {userLikes.map(item => (
                  <div key={item.id} className="like-chip">
                    <img src={item.imageUrl} alt={item.title} className="chip-img" />
                    <span>{item.brand} - ₹{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-actions">
              <button className="finish-btn" onClick={handleComplete}>
                View Top Squad Picks on Home & Shared Cart 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadSwipeGame;
