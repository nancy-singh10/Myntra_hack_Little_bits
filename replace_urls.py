import os
import glob

def replace_urls(folder_path, old_urls, new_url):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                modified = False
                for old_url in old_urls:
                    if old_url in content:
                        content = content.replace(old_url, new_url)
                        modified = True
                
                if modified:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated {file_path}")

frontend_src = r"c:\Users\NANCY_SINGH\Documents\BACKEND\myntra_hack\frontend\src"
old_urls = ["http://localhost:8000", "http://127.0.0.1:8000"]
new_url = "https://myntra-hack-little-bits.onrender.com"

replace_urls(frontend_src, old_urls, new_url)
print("Done!")
