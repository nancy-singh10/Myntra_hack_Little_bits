import sys
import os
import django

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from store.agents.stylist_agent import generate_daily_feed
import json

def test():
    print("Testing for Lucknow:")
    res = generate_daily_feed(location_str="Lucknow")
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    test()
