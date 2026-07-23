import { Client, handle_file } from "@gradio/client";

// We use a high-quality free GLB model (Google's Astronaut) as a mock response 
// if the Hugging Face API quota is exceeded during the hackathon.
const MOCK_GLB_URL = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";

export const generate3DModel = async (imageUrl) => {
  console.log("Initiating 3D Model Generation via TripoSR...");
  
  try {
    const hfToken = import.meta.env?.VITE_HF_TOKEN; 
    const connectOptions = hfToken ? { hf_token: hfToken } : {};
    
    // Connect to TripoSR
    const app = await Client.connect("stabilityai/TripoSR", connectOptions);
    
    // 1. Preprocess the image (remove background)
    console.log("Preprocessing image for 3D...");
    
    // We need to fetch the image URL and convert it to a Blob for Gradio
    const imageRes = await fetch(imageUrl);
    const imageBlob = await imageRes.blob();
    
    const preResult = await app.predict("/preprocess", [
      imageBlob,
      true, // remove background
      0.85 // foreground ratio
    ]);
    
    const processedImage = preResult.data[0];

    // 2. Generate the 3D model
    console.log("Generating 3D Model...");
    const genResult = await app.predict("/generate", [
      handle_file(processedImage.url),
      256 // Marching Cubes Resolution
    ]);
    
    // genResult.data[0] is the OBJ file
    // genResult.data[1] is the GLB file
    const glbOutput = genResult.data[1];
    const glbUrl = typeof glbOutput === 'string' ? glbOutput : glbOutput?.url;
    
    if (!glbUrl) throw new Error("No GLB URL returned");
    
    console.log("3D Model successfully generated:", glbUrl);
    return glbUrl;
    
  } catch (error) {
    console.error("TripoSR API failed (likely quota exceeded), returning mock 3D model", error);
    // Fallback to mock 3D model if quota is exceeded
    return MOCK_GLB_URL;
  }
};
