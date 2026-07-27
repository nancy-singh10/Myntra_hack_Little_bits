import React, { useState, useRef } from 'react';
import './CartTryOnModal.css';
import { generateFullOutfit } from '../../services/gradioVtonService';
import { generate3DModel } from '../../services/gradio3DService';
import { generatePoses } from '../../services/gradioPosesService';
import { removeBackgroundPhotoRoom } from '../../services/photoRoomService';

const CartTryOnModal = ({ isOpen, onClose, cartItems, userModel, setUserModel }) => {
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [isGeneratingPoses, setIsGeneratingPoses] = useState(false);
  const fileInputRef = useRef(null);

  // For this demo, let's just pick the first two items in the cart
  // In a real app, you'd add a selection UI here.
  const topItem = cartItems[0] || null;
  const bottomItem = cartItems[1] || cartItems[0] || null; // fallback to same if only 1 item

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserModel({ ...userModel, preview: URL.createObjectURL(file) }); 
      setResultImage(null); 
      setRotation(0);
      setIs3DMode(false);
      setModel3DUrl(null);
      
      // Background Removal
      setIsRemovingBg(true);
      try {
        let blob = file;
        try {
          blob = await removeBackgroundPhotoRoom(file);
        } catch (error) {
          console.error("Failed to remove background, using original:", error);
        }
        
        setIsGeneratingPoses(true);
        try {
          const poses = await generatePoses(blob);
          setUserModel({ image: blob, preview: URL.createObjectURL(blob), generatedPoses: poses, selectedPose: null });
        } catch (error) {
          console.error("Failed to generate poses:", error);
          setUserModel({ image: blob, preview: URL.createObjectURL(blob) }); 
        } finally {
          setIsGeneratingPoses(false);
        }

      } finally {
        setIsRemovingBg(false);
      }
    }
  };

  const handleSelectPose = (pose) => {
    setUserModel({ ...userModel, selectedPose: pose });
  };

  const handleGenerate = async () => {
    if ((!userModel?.selectedPose && !userModel?.image) || !topItem) return;

    setIsGenerating(true);
    try {
      const topResponse = await fetch(topItem.imageUrl);
      const topBlob = await topResponse.blob();
      
      let humanBlob = userModel.image;
      if (userModel?.selectedPose) {
        const poseResponse = await fetch(userModel.selectedPose.url);
        humanBlob = await poseResponse.blob();
      }

      const resultUrl = await generateVirtualTryOn(humanBlob, topBlob);
      setResultImage(resultUrl);
    } catch (error) {
      console.error("Failed to generate", error);
      alert("Failed to generate image. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetTryOn = () => {
    setResultImage(null);
    setRotation(0);
    setIs3DMode(false);
    setModel3DUrl(null);
  };

  const handleGenerate3D = async () => {
    setIsGenerating3D(true);
    try {
      const url = await generate3DModel(resultImage);
      setModel3DUrl(url);
      setIs3DMode(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating3D(false);
    }
  };

  return (
    <div className="cart-vton-modal-overlay">
      <div className="cart-vton-modal-content">
        <button className="cart-vton-close-btn" onClick={onClose}>&times;</button>
        <h2 className="cart-vton-title">Styling Studio</h2>
        <p className="cart-vton-subtitle">Try on your entire bag in one look</p>

        <div className="cart-vton-body">
          {!resultImage ? (
            <div className="cart-vton-setup">
              {(!userModel?.preview || isRemovingBg || isGeneratingPoses || (!userModel?.generatedPoses && !userModel?.selectedPose)) ? (
                <div className="cart-vton-image-containers">
                  {/* User Image Upload */}
                  <div className="cart-vton-upload-box" onClick={() => fileInputRef.current.click()}>
                    {userModel?.preview ? (
                      <img src={userModel.preview} alt="You" className="cart-vton-preview-img" />
                    ) : (
                      <div className="cart-vton-upload-placeholder">
                        <span className="cart-upload-icon">📸</span>
                        <p>Upload your photo</p>
                      </div>
                    )}
                    {(isRemovingBg || isGeneratingPoses) && (
                      <div className="cart-vton-bg-loader">
                        <span className="cart-spinner">⚙️</span>
                        <small>{isGeneratingPoses ? "Generating AI Poses..." : "Preparing Image..."}</small>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      style={{ display: 'none' }} 
                    />
                  </div>
                </div>
              ) : userModel?.generatedPoses && !userModel?.selectedPose ? (
                <div className="cart-vton-pose-selector">
                  <h3>Select Your AI Model</h3>
                  <p>We mapped your photo to these AI models.</p>
                  <div className="cart-vton-poses-grid">
                    {userModel.generatedPoses.map(pose => (
                      <div key={pose.id} className="cart-vton-pose-card" onClick={() => handleSelectPose(pose)}>
                        <img src={pose.url} alt={pose.name} />
                        <div className="cart-vton-pose-name">{pose.name}</div>
                      </div>
                    ))}
                  </div>
                  <button className="cart-vton-action-btn secondary" onClick={() => fileInputRef.current.click()}>
                    Upload Different Photo
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              ) : (
                <>
                  <div className="cart-vton-image-containers cart-multi-vton">
                    <div className="cart-vton-upload-box" onClick={() => setUserModel({ ...userModel, selectedPose: null })}>
                      <img src={userModel?.selectedPose?.url || userModel?.preview} alt="You" className="cart-vton-preview-img" />
                      <div className="cart-vton-change-pose-overlay">Change Pose</div>
                    </div>
                    <div className="cart-vton-plus-icon">+</div>
                    <div className="cart-vton-garments-stack">
                      {topItem && (
                        <div className="cart-vton-garment-box">
                          <img src={topItem.imageUrl} alt="Top" className="cart-vton-preview-img" />
                          <span className="cart-garment-label">Top</span>
                        </div>
                      )}
                      {bottomItem && (
                        <div className="cart-vton-garment-box">
                          <img src={bottomItem.imageUrl} alt="Bottom" className="cart-vton-preview-img" />
                          <span className="cart-garment-label">Bottom</span>
                        </div>
                      )}
                      {(!topItem && !bottomItem) && (
                        <p style={{color:'#888', fontSize:'12px', textAlign:'center', marginTop:'40px'}}>
                          Add items to bag to combine!
                        </p>
                      )}
                    </div>
                  </div>

                  <button 
                    className="cart-vton-generate-btn" 
                    disabled={(!userModel?.selectedPose && !userModel?.image) || isGenerating || !topItem}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <span className="cart-vton-loader">✨ Stitching Look (IDM-VTON)...</span>
                    ) : (
                      "Try Complete Look"
                    )}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                </>
              )}
            </div>   </div>
          ) : (
            <div className="cart-vton-result">
              <div className="cart-vton-result-image-container" style={{ perspective: '1000px' }}>
                {is3DMode ? (
                  <model-viewer
                    src={model3DUrl}
                    alt="3D Full Outfit Try-On"
                    camera-controls
                    auto-rotate
                    style={{ width: '100%', height: '100%', minHeight: '400px' }}
                  ></model-viewer>
                ) : (
                  <img 
                    src={resultImage} 
                    alt="Full Outfit Try-On" 
                    className="cart-vton-final-image" 
                    style={{ transform: `rotateY(${rotation}deg)`, transition: 'transform 0.1s linear', transformStyle: 'preserve-3d' }}
                  />
                )}
              </div>
              
              {!is3DMode && (
                <div className="cart-vton-rotation-controls">
                  <label>360° View:</label>
                  <input 
                    type="range" min="0" max="360" value={rotation} 
                    onChange={(e) => setRotation(e.target.value)} 
                    className="rotation-slider"
                  />
                </div>
              )}

              <div className="cart-vton-result-actions">
                {!is3DMode && (
                  <button 
                    className="cart-vton-action-btn primary" 
                    onClick={handleGenerate3D}
                    disabled={isGenerating3D}
                  >
                    {isGenerating3D ? "Generating 3D..." : "View in 3D"}
                  </button>
                )}
                {is3DMode && (
                  <button className="cart-vton-action-btn primary" onClick={onClose}>Done</button>
                )}
                <button className="cart-vton-action-btn secondary" onClick={resetTryOn}>Reset</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartTryOnModal;
