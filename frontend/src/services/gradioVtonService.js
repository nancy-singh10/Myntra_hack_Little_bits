export const generateVirtualTryOn = async (humanImageBlob, garmentImageBlob, category = "Upper-body") => {
  try {
    console.log("Connecting to local backend for IDM-VTON via Replicate...");
    
    const formData = new FormData();
    formData.append('user_image', humanImageBlob, 'user.jpg');
    formData.append('garment_image', garmentImageBlob, 'garment.jpg');

    const response = await fetch('http://localhost:8000/try-on/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("Prediction result:", data);
    
    if (data.tryon_image_url) {
      return data.tryon_image_url;
    } else {
      throw new Error("No image URL in result");
    }
  } catch (error) {
    console.warn("Failed to fetch resulting image, returning mock", error);
    return getMockVtonImage(category);
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
      resolve("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop");
    }, 3000);
  });
};
