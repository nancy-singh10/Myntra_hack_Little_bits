import React, { useState } from 'react';
import './CreateSquadModal.css';

const CreateSquadModal = ({ onCreateSquad, onCancel }) => {
  const [squadName, setSquadName] = useState("Ananya's Bday Squad");
  const [description, setDescription] = useState("Shopping for birthday gifts & outfits for Ananya! 🎉");
  const [copied, setCopied] = useState(false);

  const handleWhatsAppInvite = () => {
    const inviteText = `Hey! Join my shopping squad "${squadName}" on Myntra to pick outfits and split the bag! 🛍️✨\n${description}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(inviteText)}`;
    window.open(url, '_blank');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!squadName.trim()) return;
    onCreateSquad({
      name: squadName,
      description: description,
      members: ['You', 'Neha', 'Priya', 'Rohan'],
      createdAt: new Date().toLocaleDateString()
    });
  };

  return (
    <div className="create-squad-container">
      <div className="create-squad-card">
        <div className="create-squad-badge">🛍️ SQUAD SHOPPING</div>
        <h2 className="create-squad-title">Create Your Shopping Squad</h2>
        <p className="create-squad-subtitle">
          Shop together, vote on outfits, split the bill, and play the Squad Match Game with your friends!
        </p>

        <form onSubmit={handleSubmit} className="create-squad-form">
          <div className="form-group">
            <label htmlFor="squadName">Squad Name *</label>
            <input
              id="squadName"
              type="text"
              className="squad-input"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              placeholder="e.g. Ananya's Bday Squad"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="squadDescription">Note / Description (Optional)</label>
            <textarea
              id="squadDescription"
              className="squad-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Birthday outfit ideas & split gifts for Ananya!"
              rows={3}
            />
          </div>

          <div className="invite-preview-box">
            <div className="invite-box-header">
              <span className="wa-icon-large">📱</span>
              <span>Invite Friends via WhatsApp</span>
            </div>
            <p className="invite-box-text">Share the invite link so squad members can join, swipe cards & vote!</p>
            <button
              type="button"
              className="whatsapp-share-btn"
              onClick={handleWhatsAppInvite}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="wa-btn-icon" />
              {copied ? 'Invite Link Opened & Copied! ✅' : 'Invite via WhatsApp'}
            </button>
          </div>

          <div className="form-actions">
            {onCancel && (
              <button type="button" className="cancel-squad-btn" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="submit-squad-btn">
              Create Squad & Enter Split Bag ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSquadModal;
