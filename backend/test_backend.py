import requests
import os

url = "http://localhost:8000/try-on/"

# Download real test images (person + garment)
print("Downloading test images...")

# Real person image from picsum (portrait)
person_url = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=512&q=80"
garment_url = "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=512&q=80"

headers = {'User-Agent': 'Mozilla/5.0'}

r = requests.get(person_url, headers=headers, timeout=15)
with open("test_human.jpg", "wb") as f:
    f.write(r.content)
print(f"Person image: {len(r.content)} bytes")

r = requests.get(garment_url, headers=headers, timeout=15)
with open("test_garment.jpg", "wb") as f:
    f.write(r.content)
print(f"Garment image: {len(r.content)} bytes")

files = {
    'user_image': ('test_human.jpg', open('test_human.jpg', 'rb'), 'image/jpeg'),
    'garment_image': ('test_garment.jpg', open('test_garment.jpg', 'rb'), 'image/jpeg')
}

print("Sending POST request to", url)
try:
    response = requests.post(url, files=files, timeout=180)
    print("Status Code:", response.status_code)
    print("Response Text:", response.text)
except Exception as e:
    print("Request failed:", e)
