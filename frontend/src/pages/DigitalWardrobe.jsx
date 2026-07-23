import React, { useState } from 'react';
import './DigitalWardrobe.css';
import { generateUpcycle } from '../services/gradioUpcycleService';

const mockWardrobe = [
  { id: 1, name: "Basic White Tee", lastWorn: "2 days ago", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop", decaying: false },
  { id: 2, name: "Blue Denim Jacket", lastWorn: "7 months ago", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=400&auto=format&fit=crop", decaying: true },
  { id: 3, name: "Floral Summer Dress", lastWorn: "9 months ago", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=400&auto=format&fit=crop", decaying: true },
];

const DigitalWardrobe = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [upcycledImage, setUpcycledImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("make it look like a trendy office siren style");

  const handleRestyle = async (item) => {
    setSelectedItem(item);
    setUpcycledImage(null);
  };

  const executeUpcycle = async () => {
    if (!selectedItem) return;
    setIsGenerating(true);
    
    try {
      const imgResponse = await fetch(selectedItem.image);
      const imgBlob = await imgResponse.blob();
      
      const resultUrl = await generateUpcycle(imgBlob, prompt);
      setUpcycledImage(resultUrl);
    } catch (error) {
      console.error(error);
      alert("Failed to upcycle image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="wardrobe-container">
      <div className="wardrobe-header">
        <h2>My Digital Wardrobe</h2>
        <p>Track what you wear and magically upcycle forgotten pieces!</p>
      </div>

      <div className="wardrobe-grid">
        {mockWardrobe.map(item => (
          <div key={item.id} className={`wardrobe-card ${item.decaying ? 'decaying' : ''}`}>
            {item.decaying && <div className="decay-badge">Not worn in 6+ months</div>}
            <img src={item.image} alt={item.name} />
            <div className="card-info">
              <h3>{item.name}</h3>
              <p>Last worn: {item.lastWorn}</p>
              {item.decaying && (
                <button className="restyle-btn" onClick={() => handleRestyle(item)}>
                  ✨ Restyle with AI
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <div className="upcycle-modal">
          <div className="upcycle-modal-content">
            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            <h3>Restyle: {selectedItem.name}</h3>
            
            <div className="upcycle-comparison">
              <div className="upcycle-old">
                <img src={selectedItem.image} alt="Original" />
                <span>Original</span>
              </div>
              <div className="upcycle-arrow">➔</div>
              <div className="upcycle-new">
                {upcycledImage ? (
                  <img src={upcycledImage} alt="Upcycled" />
                ) : isGenerating ? (
                  <div className="upcycle-loader">Generating your new look...</div>
                ) : (
                  <div className="upcycle-placeholder">?</div>
                )}
                <span>New Trend</span>
              </div>
            </div>

            <div className="upcycle-controls">
              <label>Tell AI how to restyle it:</label>
              <input 
                type="text" 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="E.g., turn it into a trendy crop top"
              />
              <button 
                onClick={executeUpcycle} 
                disabled={isGenerating}
                className="generate-upcycle-btn"
              >
                {isGenerating ? 'Upcycling...' : 'Generate Magic'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalWardrobe;
