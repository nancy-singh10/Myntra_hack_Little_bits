import { Client } from "@gradio/client";

/**
 * Service to call a Hugging Face Space for Pose Generation.
 * Hardcoded for hackathon demo to ensure speed and bypass Unsplash blocks.
 */
export const generatePoses = async (imageBlob) => {
  console.log("Bypassing FLUX generation for demo speed. Returning local mock poses...");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'casual',
          name: 'Casual Pose',
          url: '/pose1 (3).png'
        },
        {
          id: 'standing',
          name: 'Standing Pose',
          url: '/pose2.png'
        },
        {
          id: 'fashion',
          name: 'Fashion Pose',
          url: '/pose3.png'
        }
      ]);
    }, 500); // Small 500ms delay just to show the loading state briefly
  });
};
