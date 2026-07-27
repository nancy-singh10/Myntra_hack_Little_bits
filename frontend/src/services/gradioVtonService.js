import { client } from "@gradio/client";

export const generateVirtualTryOn = async (humanImageBlob, garmentImageBlob, category = "Upper-body") => {
  console.log("Hackathon Demo Mode: Using hardcoded virtual try-on response to ensure reliability.");
  
  // Simulate processing time (1.5 seconds) so the UI shows a loading state
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("/model1_virtual-removebg-preview.png");
    }, 1500);
  });
};

/**
 * Service to call VTON sequentially for a full outfit (Top + Bottom).
 */
export const generateFullOutfit = async (humanImageBlob, topGarmentBlob, bottomGarmentBlob) => {
  try {
    // Step 1: Apply Top
    const resultWithTop = await generateVirtualTryOn(humanImageBlob, topGarmentBlob, "Upper-body");
    
    // Convert the resulting URL back to a Blob for Step 2
    const topResponse = await fetch(resultWithTop);
    const topResultBlob = await topResponse.blob();

    // Step 2: Apply Bottom to the new image
    const finalResultUrl = await generateVirtualTryOn(topResultBlob, bottomGarmentBlob, "Lower-body");
    
    return finalResultUrl;
  } catch (error) {
    console.error("Full outfit VTON failed:", error);
    throw error;
  }
};

// Fallback images for the hackathon demo if HF space is down or queued or errors out due to rate limits
export const getMockVtonImage = (category) => {
  console.log("Using fallback image due to HF Space error.");
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a dummy generated image to ensure the demo continues working
      resolve("/model1_virtual-removebg-preview.png");
    }, 3000);
  });
};

