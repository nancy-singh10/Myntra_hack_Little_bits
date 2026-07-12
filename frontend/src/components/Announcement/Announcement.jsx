import React, { useState, useEffect } from 'react';
import './Announcement.css';

const Announcement = () => {
  // Initial time representing 1 Day, 5 Hours, 18 Minutes, 32 Seconds
  const initialTime = (1 * 24 * 60 * 60) + (5 * 60 * 60) + (18 * 60) + 32;
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const days = Math.floor(timeLeft / (3600 * 24));
  const hours = Math.floor((timeLeft % (3600 * 24)) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatTime = (time) => time.toString().padStart(2, '0');

  return (
    <div className="announcement-container">
      <div className="announcement-text">
        Sale Ends In 
        <span className="time"> 
          <span className="highlight">{formatTime(days)}</span> Day : <span className="highlight">{formatTime(hours)}</span> H : <span className="highlight">{formatTime(minutes)}</span> M : <span className="highlight">{formatTime(seconds)}</span> S 
        </span>
      </div>
    </div>
  );
};

export default Announcement;
