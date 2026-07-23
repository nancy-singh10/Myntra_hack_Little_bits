async function test() {
  const faceRes = await fetch("https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400");
  const blob = await faceRes.blob();
  
  const formData = new FormData();
  formData.append('image_file', blob, 'image.jpg');

  const res = await fetch('https://sdk.photoroom.com/v1/segment', {
    method: 'POST',
    headers: {
      'x-api-key': 'sandbox_sk_pr_modelcreation_a7050d89234782be938246ecd63b37240e4f556f'
    },
    body: formData
  });

  if (res.ok) {
    console.log("PhotoRoom API works!");
  } else {
    console.log(await res.text());
  }
}

test();
