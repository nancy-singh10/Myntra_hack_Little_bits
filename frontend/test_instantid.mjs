import { Client } from "@gradio/client";

async function test() {
  try {
    const app = await Client.connect("InstantX/InstantID");
    const app_info = await app.view_api();
    console.log(JSON.stringify(app_info, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
