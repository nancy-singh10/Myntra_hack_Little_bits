from gradio_client import Client, handle_file

try:
    print("Connecting to IDM-VTON...")
    client = Client("yisol/IDM-VTON", token="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")
    print("Connected. Generating predict...")
    
    # We just need some dummy image to test if it connects and starts predicting,
    # or if it fails immediately with an auth error.
    # Note: creating dummy images in python
    from PIL import Image
    import tempfile
    
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f_user:
        img = Image.new("RGB", (100, 100), color="white")
        img.save(f_user.name)
        
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f_garm:
        img = Image.new("RGB", (100, 100), color="blue")
        img.save(f_garm.name)
        
    result = client.predict(
        dict={'background': handle_file(f_user.name), 'layers': [], 'composite': handle_file(f_user.name)},
        garm_img=handle_file(f_garm.name),
        garment_des="A test garment",
        is_checked=True,
        is_checked_crop=False,
        denoise_steps=20,  # minimum 20
        seed=42,
        api_name="/tryon"
    )
    print("SUCCESS!")
    print(result)
except Exception as e:
    print("ERROR:")
    print(e)
