import { Client } from "@gradio/client";

async function test() {
  try {
    const app = await Client.connect("InstantX/InstantID");
    
    // Fetch a sample face image
    const faceRes = await fetch("https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400");
    const faceBlob = await faceRes.blob();

    console.log("Sending to InstantID...");
    const result = await app.predict("/generate_image", [
      faceBlob,
      null, // pose_image
      "A casual portrait of a person standing",
      "", // negative prompt
      "(No style)",
      20, // num_steps
      0.8,
      0.8,
      0.4,
      0.4,
      [], // controlnet
      5,
      42,
      "EulerDiscreteScheduler",
      false,
      true
    ]);
    
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

test();
