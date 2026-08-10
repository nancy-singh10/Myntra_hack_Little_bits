export const generatePoses = async (imageBlob) => {
  console.log("Using user's uploaded image directly for Virtual Try-On...");
  const imageUrl = typeof imageBlob === 'string' ? imageBlob : URL.createObjectURL(imageBlob);
  return [
    {
      id: 'original',
      name: 'Your Uploaded Photo',
      url: imageUrl
    }
  ];
};
