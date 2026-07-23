import { Client } from "@gradio/client";

/**
 * Service to call a Hugging Face Space for Pose Generation.
 * We are using FLUX.1-schnell.
 */
export const generatePoses = async (imageBlob) => {
  console.log("Connecting to FLUX.1-schnell for pose generation...");
  
  try {
    // If a token is provided in env, use it to bypass zero-gpu limits
    // Note: since this is frontend, you would normally use VITE_HF_TOKEN
    const hfToken = import.meta.env?.VITE_HF_TOKEN; 
    
    if (!hfToken) {
      console.warn("No HF Token found. Bypassing FLUX to prevent hanging and using mock poses.");
      throw new Error("No HF Token");
    }

    // In @gradio/client, we pass the token in options if available
    const connectOptions = { hf_token: hfToken };
    const app = await Client.connect("black-forest-labs/FLUX.1-schnell", connectOptions);
    
    // We run 3 prompts in parallel
    const prompts = [
      { id: "casual", name: "Casual Pose", text: "A casual photorealistic portrait of a young person standing, looking at camera, high quality" },
      { id: "standing", name: "Standing Pose", text: "A photorealistic full body standing pose of a young person, fashion model, high quality" },
      { id: "fashion", name: "Fashion Pose", text: "A photorealistic high fashion editorial pose of a young person, dynamic lighting, high quality" }
    ];

    const generatePromise = async (pose) => {
      try {
        const result = await app.predict("/infer", [
          pose.text,
          Math.floor(Math.random() * 1000000), // random seed
          true, // randomize seed
          500, // width
          700, // height
          4, // num inference steps
        ]);
        
        // result.data[0] contains the generated image url/object
        const output = result.data[0];
        const imageUrl = typeof output === 'string' ? output : output?.url;
        
        if (!imageUrl) throw new Error("No image generated");
        return { id: pose.id, name: pose.name, url: imageUrl };
      } catch (err) {
        console.warn(`Failed to generate ${pose.name}`, err);
        throw err; // throw to be caught by Promise.all
      }
    };

    console.log("Sending prediction requests...");
    const results = await Promise.all(prompts.map(generatePromise));
    return results;

  } catch (error) {
    console.error("HF Space API failed (likely quota exceeded), returning mock poses", error);
    // Fallback to mock images
    return [
      {
        id: 'casual',
        name: 'Casual Pose',
        url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'standing',
        name: 'Standing Pose',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'fashion',
        name: 'Fashion Pose',
        url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop'
      }
    ];
  }
};
