import React, { useState } from 'react';
import './CreateSquadModal.css';

const CreateSquadModal = ({ onCreateSquad, onCancel }) => {
  const [squadName, setSquadName] = useState("Ananya's Bday Squad");
  const [description, setDescription] = useState("Shopping for birthday gifts & outfits for Ananya! 🎉");
  const [copied, setCopied] = useState(false);

  const handleWhatsAppInvite = () => {
    const inviteText = `Hey! Join my shopping group "${squadName}" on Myntra to pick outfits and split the bag! 🛍️✨\n${description}`;
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
        <div className="create-squad-badge">🛍️ GROUP SHOPPING</div>
        <h2 className="create-squad-title">Create Your Shopping Group</h2>
        <p className="create-squad-subtitle">
          Shop together, vote on outfits, split the bill, and play the Group Match Game with your friends!
        </p>

        <form onSubmit={handleSubmit} className="create-squad-form">
          <div className="form-group">
            <label htmlFor="squadName">Group Name *</label>
            <input
              id="squadName"
              type="text"
              className="squad-input"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              placeholder="e.g. Ananya's Bday Group"
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

          <div className="invite-preview-box" style={{ textAlign: 'center' }}>
            <div className="invite-box-header" style={{ justifyContent: 'center' }}>
              <span className="wa-icon-large">🔗</span>
              <span>Invite Friends</span>
            </div>
            <p className="invite-box-text">Once you create your group, you'll get a magic invite link to share with your friends!</p>
          </div>

          <div className="form-actions">
            {onCancel && (
              <button type="button" className="cancel-squad-btn" onClick={onCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="submit-squad-btn">
              Create Group & Enter Shared Cart ✨
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSquadModal;
