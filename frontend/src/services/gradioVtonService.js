import { client } from "@gradio/client";

export const generateVirtualTryOn = async (humanImageBlob, garmentImageBlob, category = "Upper-body") => {
  try {
    const formData = new FormData();
    // Using keys matching the backend store/views.py (user_image and garment_image)
    formData.append('user_image', humanImageBlob, 'user.jpg');
    formData.append('garment_image', garmentImageBlob, 'garment.jpg');

    const response = await fetch('http://localhost:8000/try-on/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Try-on failed with status: ${response.status}`);
    }

    const data = await response.json();
    return `http://localhost:8000${data.tryon_image_url}`;
  } catch (error) {
    console.error("Virtual Try-On error:", error);
    throw error;
  }
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

