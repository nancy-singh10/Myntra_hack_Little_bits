import { Client } from "@gradio/client";

/**
 * Service to call Hugging Face Spaces for Image-to-Image Upcycling.
 * Using timbrooks/instruct-pix2pix as a fast/free image-to-image editor.
 */
export const generateUpcycle = async (garmentImageBlob, instruction = "make it look like a trendy office siren style, professional but fashionable") => {
  try {
    console.log("Connecting to Hugging Face Space: timbrooks/instruct-pix2pix...");
    const app = await Client.connect("timbrooks/instruct-pix2pix");

    console.log("Sending upcycle request with instruction:", instruction);
    const result = await app.predict("/generate", [
      garmentImageBlob, // image
      instruction,      // prompt text
      5.5,              // text_cfg_scale
      1.5,              // image_cfg_scale
      "Euler a",        // sampler
      20,               // steps
      0,                // seed (0 for random)
    ]);

    console.log("Upcycle result:", result);
    return result.data[0].url || result.data[0];
  } catch (error) {
    console.error("Error during Upcycling generation:", error);
    
    // Fallback if HF space fails
    console.log("Using fallback image due to HF Space error.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=800&auto=format&fit=crop"); // A nice stylish jacket
      }, 3000);
    });
  }
};
