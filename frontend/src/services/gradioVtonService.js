import { client } from "@gradio/client";

const BACKEND_URL = "https://myntra-hack-little-bits.onrender.com";

export const generateVirtualTryOn = async (humanImageBlob, garmentImageBlob, category = "Upper-body") => {
  try {
    const formData = new FormData();
    // Using keys matching the backend store/views.py (user_image and garment_image)
    formData.append('user_image', humanImageBlob, 'user.jpg');
    formData.append('garment_image', garmentImageBlob, 'garment.jpg');

    const response = await fetch('https://myntra-hack-little-bits.onrender.com/try-on/', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Try-on failed with status: ${response.status}`);
    }

    const data = await response.json();
    return `https://myntra-hack-little-bits.onrender.com${data.tryon_image_url}`;
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
    const resultWithTop = await generateVirtualTryOn(humanImageBlob, topGarmentBlob, "Upper-body");
    const topResponse = await fetch(resultWithTop);
    const topResultBlob = await topResponse.blob();
    const finalResultUrl = await generateVirtualTryOn(topResultBlob, bottomGarmentBlob, "Lower-body");
    return finalResultUrl;
  } catch (error) {
    console.error("Full outfit VTON failed:", error);
    throw error;
  }
};

export const getMockVtonImage = (category) => {
  return Promise.resolve(null);
};

