import { Client } from "@gradio/client";

async function test() {
  try {
    console.log("Connecting to FLUX.1-schnell...");
    const app = await Client.connect("black-forest-labs/FLUX.1-schnell");
    
    console.log("Generating image...");
    const result = await app.predict("/infer", [
      "A casual portrait of a young person standing", // prompt
      42, // seed
      true, // randomize seed
      500, // width
      700, // height
      4, // num inference steps
    ]);
    
    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

test();
