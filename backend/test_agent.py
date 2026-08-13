import os
import django
import sys

sys.path.append('c:/Users/NANCY_SINGH/Documents/BACKEND/myntra_hack/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from store.agents.stylist_agent import generate_daily_feed
import json

try:
    res = generate_daily_feed('Hazratganj, Lucknow (226001)')
    print(json.dumps(res, indent=2))
except Exception as e:
    print(f"Error: {e}")
