export const removeBackgroundPhotoRoom = async (imageBlob) => {
  // Bypassing background removal to prevent the UI from hanging
  // while downloading heavy WASM models on slow connections.
  // The VTON model can handle images with backgrounds!
  console.log("Bypassing background removal for speed...");
  return imageBlob;
};
