import os
import json
import google.generativeai as genai
from .trend_agent import analyze_trends
from .finance_agent import check_wardrobe_overlap
from ..integrations.weather_service import get_forecast
from ..integrations.calendar_service import get_upcoming_events
from dotenv import load_dotenv

load_dotenv()

def generate_daily_feed(user=None, location_str="Indiranagar, Bengaluru (560038)"):
    """
    Orchestrates the AI Stylist feature by gathering context and generating recommendations via Gemini.
    """
    # 1. Get Context
    weather = get_forecast(location_name=location_str)
    events = get_upcoming_events(user, location_str)
    trends = analyze_trends(location_str)
    
    # 2. Dynamic generation using Gemini
    gemini_key = os.environ.get("GEMINI_API_KEY")
    
    if "lucknow" in location_str.lower():
        fallback_outfits = [
            {
                "title": "Family Gathering - Chikankari",
                "tag": "Best for 11:00",
                "desc": "A traditional Chikankari suit perfectly suited for a cultural gathering.",
                "items": [{"name": "Kurti", "image_url": "/kurti-1.png"}, {"name": "Pant", "image_url": "/suitpant.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": "Chikankari is the soul of Lucknow. It keeps you cool and pays homage to local heritage.",
                "finance_agent": "A timeless classic. Handloom pieces retain their cultural value over time."
            },
            {
                "title": "Modern Dinner, Hazratganj",
                "tag": "Evening wear",
                "desc": "A chic modern outfit to seamlessly blend in at Hazratganj's popular cafes.",
                "items": [{"name": "Top", "image_url": "/meetingcptop.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": "A clean, modern silhouette that looks stylish under Hazratganj's evening lights.",
                "finance_agent": "Using your core versatile pieces saves you from unnecessary impulse shopping."
            }
        ]
    else:
        fallback_outfits = [
            {
                "title": "Meeting - CP",
                "tag": "Best for 14:00",
                "desc": "Breathable cotton, structured shoulder for the 14:00 room.",
                "items": [{"name": "Top", "image_url": "/meetingcptop.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": "The sheer sleeves and floral pattern commands attention in the boardroom while the lightweight material keeps you cool during the 2 PM heat.",
                "finance_agent": "Investing in this statement piece lowers your cost-per-wear since it easily transitions from formal meetings to casual Fridays."
            },
            {
                "title": "Desk to Dinner",
                "tag": "Layer down",
                "desc": "Swap the blazer for a relaxed tee at 18:00 — same base.",
                "items": [{"name": "White Tee", "image_url": "/custom-top.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": "By removing the formal blazer, you instantly shift the vibe from professional to evening casual without changing your core outfit.",
                "finance_agent": "Versatile base layers like these jeans save you money—buy once, style twice!"
            }
        ]

    # Default fallback data
    final_data = {
        "greeting": f"Morning! It's a {weather['conditions']} {weather['temperature']}°C weekend ahead.",
        "location": location_str,
        "weather": {
            "temp": f"{weather['temperature']}°C",
            "description": weather['description'].capitalize()
        },
        "events": events,
        "outfits_heading": "Looks curated for you:",
        "outfits": fallback_outfits
    }
    
    if gemini_key:
        try:
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-flash-latest')
            prompt = f"""
            You are a personalized AI fashion stylist. 
            User's Location: {location_str}
            Current Weather: {weather['temperature']}°C, {weather['conditions']} ({weather['description']})
            Upcoming Events: {json.dumps(events)}
            Trending locally: {trends['trending_items']}
            
            Generate a JSON response containing the daily feed for the user. 
            CRITICAL RULES:
            - Your recommendations MUST heavily incorporate the Current Weather ({weather['temperature']}°C, {weather['description']}). Suggest breathable/light fabrics for heat, layering for cold, rain-safe gear if raining, etc.
            - Deeply consider the User's Location ({location_str}) and its local cultural fashion preferences. For example, if in Lucknow, prioritize Chikankari or traditional wear for cultural events; if in Bengaluru, suggest tech-casual or smart-casual streetwear; if in Delhi, suggest trendy, layered, or bold outfits fitting the local vibe.
            - Output MUST be valid JSON, with NO markdown formatting (no ```json).
            
            Format required:
            {{
                "greeting": "Hi [Name] — good morning. Here's your day and what I'd wear for it.",
                "location": "{location_str}",
                "weather": {{
                    "temp": "{weather['temperature']}°C",
                    "description": "{weather['description']}"
                }},
                "events": [
                    {{"time": "14:00", "title": "Board review", "subtitle": "Sharp, quiet"}}
                ],
                "outfits_heading": "Three looks, all from pieces you own:",
                "outfits": [
                    {{
                        "title": "Short title (e.g. Board Review - Res...)",
                        "tag": "Best for 14:00",
                        "description": "Short explanation of why this outfit works for the weather/event/culture.",
                        "items": [
                            {{"name": "White Shirt", "image_url": "https://via.placeholder.com/150"}},
                            {{"name": "Trousers", "image_url": "https://via.placeholder.com/150"}}
                        ]
                    }}
                ]
            }}
            
            Ensure you create exactly 2 outfits based on the Upcoming Events and weather. Provide dummy placeholder image URLs.
            """
            response = model.generate_content(prompt)
            text = response.text.strip()
            
            # Use regex to find the JSON object to avoid markdown parsing errors
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
            
            parsed_data = json.loads(text)
            final_data.update(parsed_data)
        except Exception as e:
            print(f"Gemini Daily Feed Error: {e}")

    return final_data

def generate_recommendation(query, location_str="Indiranagar, Bengaluru (560038)"):
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        return {
            "title": "Fallback Outfit",
            "items": [],
            "style_agent": "Please set GEMINI_API_KEY for dynamic styling.",
            "finance_agent": "Please set GEMINI_API_KEY for financial insights."
        }
    
    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = f"""
        You are an AI styling engine for Myntra. 
        User Query: "{query}"
        Location Context: "{location_str}"
        
        Generate a JSON response representing personalized outfit recommendations.
        DO NOT include markdown block formatting (no ```json or ```). Return ONLY valid JSON.
        Format required:
        {{
            "title": "Short catchy title for the scenario",
            "items": [
                {{"name": "Item Name", "category": "top/bottom/shoes/accessories", "id": 1}},
                {{"name": "Item Name", "category": "top/bottom/shoes/accessories", "id": 2}}
            ],
            "style_agent": "1 short sentence explaining why this style fits the user's query and location.",
            "finance_agent": "1 short sentence giving a financial tip (e.g. found a cheaper alternative, maximizing cost-per-wear, great discount)."
        }}
        
        CRITICAL RULES:
        - Deeply analyze the User Query ("{query}") and the Location Context ("{location_str}"). 
        - If the location is Lucknow or the query involves cultural events/festivals, heavily prioritize ethnic wear like Chikankari suits, kurtis, and traditional styling.
        - If the location is a metropolitan tech city like Bengaluru, lean towards smart-casual, tech-wear, or modern comfortable outfits.
        - The style_agent text MUST explicitly mention the cultural relevance or local climate suitability of the outfit.
        - Generate 1 or 2 outfits based STRICTLY on this synthesized context.
        - The response can be a single object (1 outfit) OR an array of objects (if 2 outfits). Return a single object if 1 outfit.
        """
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)
    except Exception as e:
        print(f"Gemini Recommendation Error: {e}")
        return {
            "title": f"Outfit for {query}",
            "items": [],
            "style_agent": "Great choice for the occasion!",
            "finance_agent": "Found a great deal on similar items on Myntra."
        }
