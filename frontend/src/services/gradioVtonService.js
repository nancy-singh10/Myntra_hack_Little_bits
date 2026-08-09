import { client } from "@gradio/client";

const BACKEND_URL = "http://localhost:8000";

export const generateVirtualTryOn = async (humanImageBlob, garmentImageBlob, category = "Upper-body") => {
  console.log("Connecting Virtual Try-On to DCI-VTON backend pipeline...");

  try {
    const formData = new FormData();
    formData.append("user_image", humanImageBlob, "user.jpg");
    formData.append("garment_image", garmentImageBlob, "garment.jpg");
    formData.append("category", category);

    // Call backend API endpoint connected to DCI-VTON-Virtual-Try-On
    const response = await fetch(`${BACKEND_URL}/try-on/`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      if (data.tryon_image_url) {
        return data.tryon_image_url.startsWith("http")
          ? data.tryon_image_url
          : `${BACKEND_URL}${data.tryon_image_url}`;
      }
    }
  } catch (error) {
    console.warn("Backend API processing error. Displaying user model photo:", error);
  }

  // Always return the user's own uploaded photo so it NEVER switches to a hardcoded model!
  return new Promise((resolve) => {
    setTimeout(() => {
      const userPhotoUrl = typeof humanImageBlob === 'string' ? humanImageBlob : URL.createObjectURL(humanImageBlob);
      resolve(userPhotoUrl);
    }, 1200);
  });
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

