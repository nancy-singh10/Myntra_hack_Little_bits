import React, { useState, useRef } from 'react';
import './VirtualTryOnModal.css';
import { generateVirtualTryOn } from '../../services/gradioVtonService';
import { generate3DModel } from '../../services/gradio3DService';
import { generatePoses } from '../../services/gradioPosesService';
import { removeBackgroundPhotoRoom } from '../../services/photoRoomService';

const VirtualTryOnModal = ({ isOpen, onClose, garmentImage, userModel, setUserModel }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const [model3DUrl, setModel3DUrl] = useState(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [isGeneratingPoses, setIsGeneratingPoses] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserModel({ ...userModel, preview: URL.createObjectURL(file) }); // Show original immediately
      setResultImage(null); // Reset previous results
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
    if ((!userModel?.selectedPose && !userModel?.image) || !garmentImage) return;

    setIsGenerating(true);
    try {
      const garmentResponse = await fetch(garmentImage);
      const garmentBlob = await garmentResponse.blob();
      
      let humanBlob = userModel.image;
      if (userModel?.selectedPose) {
        const poseResponse = await fetch(userModel.selectedPose.url);
        humanBlob = await poseResponse.blob();
      }

      const resultUrl = await generateVirtualTryOn(humanBlob, garmentBlob);
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
    <div className="vton-modal-overlay">
      <div className="vton-modal-content">
        <button className="vton-close-btn" onClick={onClose}>&times;</button>
        <h2 className="vton-title">Digital Try-On</h2>
        <p className="vton-subtitle">See yourself in this outfit powered by GenAI</p>

        <div className="vton-body">
          {!resultImage ? (
            <div className="vton-setup">
              {(!userModel?.preview || isRemovingBg || isGeneratingPoses || (!userModel?.generatedPoses && !userModel?.selectedPose)) ? (
                <div className="vton-image-containers">
                  {/* User Image Upload */}
                  <div className="vton-upload-box" onClick={() => fileInputRef.current.click()}>
                    {userModel?.preview ? (
                      <img src={userModel.preview} alt="You" className="vton-preview-img" />
                    ) : (
                      <div className="vton-upload-placeholder">
                        <span className="upload-icon">📸</span>
                        <p>Upload your photo</p>
                      </div>
                    )}
                    {(isRemovingBg || isGeneratingPoses) && (
                      <div className="vton-bg-loader">
                        <span className="spinner">⚙️</span>
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
                <div className="vton-pose-selector">
                  <h3>Select Your AI Model</h3>
                  <p>We mapped your photo to these AI models.</p>
                  <div className="vton-poses-grid">
                    {userModel.generatedPoses.map(pose => (
                      <div key={pose.id} className="vton-pose-card" onClick={() => handleSelectPose(pose)}>
                        <img src={pose.url} alt={pose.name} />
                        <div className="vton-pose-name">{pose.name}</div>
                      </div>
                    ))}
                  </div>
                  <button className="vton-action-btn secondary" onClick={() => fileInputRef.current.click()}>
                    Upload Different Photo
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                </div>
              ) : (
                <>
                  <div className="vton-image-containers">
                    <div className="vton-upload-box" onClick={() => setUserModel({ ...userModel, selectedPose: null })}>
                      <img src={userModel?.selectedPose?.url || userModel?.preview} alt="You" className="vton-preview-img" />
                      <div className="vton-change-pose-overlay">Change Pose</div>
                    </div>
                    <div className="vton-plus-icon">+</div>
                    <div className="vton-garment-box">
                      <img src={garmentImage} alt="Garment" className="vton-preview-img" />
                    </div>
                  </div>

                  <button 
                    className="vton-generate-btn" 
                    disabled={(!userModel?.selectedPose && !userModel?.image) || isGenerating}
                    onClick={handleGenerate}
                  >
                    {isGenerating ? (
                      <span className="vton-loader">✨ Generating Try-On (DCI-VTON)...</span>
                    ) : (
                      "Try It On"
                    )}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
                </>
              )}
            </div>
          ) : (
            <div className="vton-result">
              <div className="vton-result-image-container" style={{ perspective: '1000px' }}>
                {is3DMode ? (
                  <model-viewer
                    src={model3DUrl}
                    alt="3D Generated Try-On"
                    camera-controls
                    auto-rotate
                    style={{ width: '100%', height: '100%', minHeight: '400px' }}
                  ></model-viewer>
                ) : (
                  <img 
                    src={resultImage} 
                    alt="Generated Try-On" 
                    className="vton-final-image" 
                    style={{ transform: `rotateY(${rotation}deg)`, transition: 'transform 0.1s linear', transformStyle: 'preserve-3d' }}
                  />
                )}
              </div>
              
              {!is3DMode && (
                <div className="vton-rotation-controls">
                  <label>360° View:</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={rotation} 
                    onChange={(e) => setRotation(e.target.value)} 
                    className="rotation-slider"
                  />
                </div>
              )}

              <div className="vton-result-actions">
                {!is3DMode && (
                  <button 
                    className="vton-action-btn primary" 
                    onClick={handleGenerate3D}
                    disabled={isGenerating3D}
                  >
                    {isGenerating3D ? "Generating 3D..." : "View in 3D"}
                  </button>
                )}
                {is3DMode && (
                  <button className="vton-action-btn primary">Add to Bag</button>
                )}
                <button className="vton-action-btn secondary" onClick={resetTryOn}>Try Another</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOnModal;
