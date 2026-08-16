import React from 'react';
import './SquadSelector.css';

const SquadSelector = ({ squads, onSelectSquad, onCreateNewSquad }) => {
  return (
    <div className="squad-selector-container">
      <div className="squad-selector-header">
        <div>
          <span className="squad-badge-pill">🛍️ MULTI-GROUP SHOPPING</span>
          <h2 className="squad-selector-title">My Groups & Shared Carts</h2>
          <p className="squad-selector-subtitle">
            You are part of {squads.length} shopping groups. Select a group to shop together, play the Swipe Game, or split bills!
          </p>
        </div>
        <button className="create-new-squad-btn" onClick={onCreateNewSquad}>
          <span>➕</span> Create New Group
        </button>
      </div>

      <div className="squads-grid">
        {squads.map((squad) => (
          <div key={squad.id} className={`squad-card ${squad.isActive ? 'active-squad-card' : ''}`}>
            <div className="squad-card-top">
              <span className="squad-icon">{squad.icon || '🛍️'}</span>
              <div className="squad-card-titles">
                <h3 className="squad-name">{squad.name}</h3>
                <span className="squad-created-date">Created {squad.createdAt || 'Recently'}</span>
              </div>
            </div>

            {squad.description && (
              <p className="squad-desc">"{squad.description}"</p>
            )}

            <div className="squad-stats-row">
              <div className="squad-stat">
                <span className="stat-label">Items in Bag</span>
                <span className="stat-value">{squad.itemCount || 2} Items</span>
              </div>
              <div className="squad-stat">
                <span className="stat-label">Bag Total</span>
                <span className="stat-value">₹{squad.totalAmount || 1693}</span>
              </div>
            </div>

            <div className="squad-members-row">
              <span className="members-label">Members ({squad.members?.length || 4}):</span>
              <div className="members-avatars">
                {squad.members?.slice(0, 4).map((member, idx) => (
                  <span key={idx} className="member-circle" title={member}>
                    {member[0]}
                  </span>
                ))}
                {squad.members?.length > 4 && (
                  <span className="more-members-tag">+{squad.members.length - 4}</span>
                )}
              </div>
            </div>

            <button
              className="enter-squad-btn"
              onClick={() => onSelectSquad(squad.id)}
            >
              Enter Shared Cart →
            </button>
          </div>
        ))}

        {/* Create New Squad Action Card */}
        <div className="squad-card create-card" onClick={onCreateNewSquad}>
          <div className="create-card-icon">✨</div>
          <h3>Create New Group</h3>
          <p>Start a new split bag for birthday, trip, or festive shopping with friends!</p>
          <button className="create-action-btn">Create Group ➕</button>
        </div>
      </div>
    </div>
  );
};

export default SquadSelector;
