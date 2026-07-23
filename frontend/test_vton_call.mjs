import { Client } from "@gradio/client";

async function test() {
  try {
    const faceRes = await fetch("https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400");
    const faceBlob = await faceRes.blob();
    
    const app = await Client.connect("yisol/IDM-VTON");
    const result = await app.predict("/tryon", [
      {"background": faceBlob, "layers": [], "composite": null},
      faceBlob,
      "A cool garment",
      true,
      true,
      30,
      42,
    ]);
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

test();
