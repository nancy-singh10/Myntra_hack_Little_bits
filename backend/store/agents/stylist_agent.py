import os
import json
import google.generativeai as genai
from .trend_agent import analyze_trends
from .finance_agent import check_wardrobe_overlap
from ..integrations.weather_service import get_forecast
from ..integrations.calendar_service import get_upcoming_events
from dotenv import load_dotenv

load_dotenv()

def generate_daily_feed(user=None, location_str="Indiranagar, Bengaluru (560038)", ical_url=None):
    """
    Orchestrates the AI Stylist feature by gathering context and generating recommendations via Gemini.
    """
    # 1. Get Context
    weather = get_forecast(location_name=location_str)
    events = get_upcoming_events(user, location_str, ical_url)
    trends = analyze_trends(location_str)
    
    is_delhi = "delhi" in location_str.lower() or "cp" in location_str.lower()
    
    dynamic_outfits = []
    # Only use personal calendar events if the user is in their home city (Delhi)
    if is_delhi and events:
        for event in events:
            event_date = event.get('date', '')
            event_weather = None
            for day in weather.get('forecast', []):
                if day['date'] == event_date:
                    event_weather = day
                    break
            
            # Default weather info if not found in forecast
            weather_desc = event_weather['description'] if event_weather else weather.get('conditions', 'pleasant')
            max_temp = event_weather['max_temp'] if event_weather else weather.get('temperature', 25)
            
            event_title_lower = event.get('title', '').lower()
            
            style_agent_text = ""
            finance_agent_text = ""
            
            # Smart fallback item selection based on EVENT TITLE and weather
            if "wedding" in event_title_lower or "haldi" in event_title_lower or "marriage" in event_title_lower or "festival" in event_title_lower:
                if "lucknow" in location_str.lower():
                    items = [{"name": "Chikankari Kurti", "image_url": "/kurti-1.png"}, {"name": "Pant", "image_url": "/suitpant.png"}, {"name": "Flats", "image_url": "/custom-shoe.png"}]
                    desc = f"A traditional Chikankari suit perfectly suited for the cultural '{event.get('title', '')}'."
                    style_agent_text = f"The hand-embroidered Chikankari Kurti is highly breathable for the {max_temp}°C weather and deeply matches the cultural essence of Lucknow."
                    finance_agent_text = "Handloom pieces are timeless investments that can be worn for years across various festivals."
                elif "jaipur" in location_str.lower():
                    items = [{"name": "Bandhani Lehenga", "image_url": "/lehenga_.png"}, {"name": "Jewelry", "image_url": "/custom-sunglasses.png"}, {"name": "Heels", "image_url": "/custom-shoe.png"}]
                    desc = f"A beautiful traditional Bandhani fit for the festive '{event.get('title', '')}'."
                    style_agent_text = f"Bandhani prints offer a vibrant, regal aesthetic that perfectly aligns with Jaipur's rich heritage."
                    finance_agent_text = "Traditional Lehengas have incredible cost-per-wear value for future weddings and festivals."
                else:
                    items = [{"name": "Festive Suit", "image_url": "/custom-yellow-suit.png"}, {"name": "Pant", "image_url": "/suitpant.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}]
                    desc = f"Curated specifically for your event: {event.get('title', '')}. Warm tones for a festive vibe."
                    style_agent_text = f"The bright festive suit brings excellent energy for a {weather_desc.lower()} day, and pairs seamlessly with neutral pants."
                    finance_agent_text = "Purchasing a versatile suit set allows you to mix-and-match the top and pants for different occasions."
            elif "flight" in event_title_lower or "travel" in event_title_lower or "airport" in event_title_lower:
                items = [{"name": "Comfort Tee", "image_url": "/custom-top.png"}, {"name": "Sweatpants", "image_url": "/custom-jeans.png"}, {"name": "Sneakers", "image_url": "/custom-shoe.png"}]
                desc = f"Breathable layers for your {event.get('title', '')}. Perfect for AC environments."
                style_agent_text = "The combination of a relaxed tee and sweatpants gives you maximum mobility for travel while looking effortlessly chic."
                finance_agent_text = "These core basics have incredible ROI. You'll wear these sneakers and sweatpants heavily in your day-to-day life."
            elif "party" in event_title_lower or "dinner" in event_title_lower or "birthday" in event_title_lower:
                items = [{"name": "Party Top", "image_url": "/orange_tie_top.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Heels", "image_url": "/custom-shoe.png"}]
                desc = f"Chic and relaxed look for '{event.get('title', '')}'. Great for the evening."
                style_agent_text = "This tie-top adds a sophisticated flair, and pairing it with denim keeps it grounded for a fun, relaxed evening."
                finance_agent_text = "A statement party top instantly elevates your existing denim collection, saving you from buying full outfits."
            elif "meeting" in event_title_lower or "work" in event_title_lower or "office" in event_title_lower:
                items = [{"name": "Formal Top", "image_url": "/meetingcptop.png"}, {"name": "Trousers", "image_url": "/suitpant.png"}, {"name": "Loafers", "image_url": "/custom-shoe.png"}]
                desc = f"Sharp, structured pieces for '{event.get('title', '')}'. Professional and comfortable."
                style_agent_text = f"The structured trousers and formal top command respect, while the breathable fabric keeps you composed in {max_temp}°C weather."
                finance_agent_text = "Workwear staples are a smart investment. These trousers can be styled down for weekends too."
            elif "rain" in weather_desc.lower():
                items = [{"name": "Light Jacket", "image_url": "/custom-top.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}]
                desc = f"Weather-appropriate layers for the rain during '{event.get('title', '')}'."
                style_agent_text = "The light jacket provides a protective layer against the rain without overheating you."
                finance_agent_text = "A quality transitional jacket bridges the gap between seasons, extending the life of your summer clothes."
            elif int(max_temp) > 30:
                items = [{"name": "Summer Top", "image_url": "/custom-top.png"}, {"name": "Breathable Bottoms", "image_url": "/custom-jeans.png"}, {"name": "Sandals", "image_url": "/custom-shoe.png"}]
                desc = f"Light cotton layers to beat the {max_temp}°C heat for '{event.get('title', '')}'."
                style_agent_text = f"Cotton blends are essential for {max_temp}°C weather. The open-toe sandals keep things airy."
                finance_agent_text = "Investing in high-quality summer basics prevents rapid wear-and-tear from frequent washing."
            else:
                items = [{"name": "Casual Top", "image_url": "/custom-top.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}]
                desc = f"Versatile styling for '{event.get('title', '')}' at {max_temp}°C."
                style_agent_text = f"A perfectly balanced casual outfit that adapts to {weather_desc.lower()} weather."
                finance_agent_text = "These everyday items will quickly become the most cost-effective pieces in your wardrobe."

            dynamic_outfits.append({
                "title": event.get("title", "Upcoming Event"),
                "tag": f"Best for {event_date}",
                "desc": desc,
                "items": items,
                "style_agent": style_agent_text,
                "finance_agent": finance_agent_text
            })

    if dynamic_outfits:
        fallback_outfits = dynamic_outfits
    elif "lucknow" in location_str.lower():
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
                "finance_agent": "Investing in modern, versatile pieces ensures you get maximum value and wear out of your wardrobe additions."
            }
        ]
    elif "jaipur" in location_str.lower():
        fallback_outfits = [
            {
                "title": "Cultural Event - Bandhani",
                "tag": "Best for 18:00",
                "desc": "A vibrant Bandhani outfit that pays homage to Rajasthan's heritage.",
                "items": [{"name": "Lehenga", "image_url": "/lehenga_.png"}, {"name": "Jewelry", "image_url": "/custom-sunglasses.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": "Bandhani is deeply rooted in Jaipur's culture. This look blends tradition with modern comfort.",
                "finance_agent": "Traditional pieces are long-term investments that never go out of style."
            }
        ]
    else:
        city_name = location_str.split(',')[0].strip() if ',' in location_str else location_str.strip()
        if not city_name: city_name = "your destination"
        fallback_outfits = [
            {
                "title": f"Exploring {city_name}",
                "tag": "City walk",
                "desc": f"A comfortable, versatile look perfect for a day out in {city_name}.",
                "items": [{"name": "Casual Top", "image_url": "/custom-top.png"}, {"name": "Jeans", "image_url": "/custom-jeans.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": f"This versatile outfit strikes the right balance between comfort and style for {city_name}'s weather.",
                "finance_agent": "These wardrobe staples have incredible cost-per-wear value for everyday exploring."
            },
            {
                "title": f"{city_name} Evening",
                "tag": "Dinner / Lounge",
                "desc": f"An elevated evening look for {city_name}'s vibrant nightlife or casual dining.",
                "items": [{"name": "Tie Top", "image_url": "/orange_tie_top.png"}, {"name": "Trousers", "image_url": "/suitpant.png"}, {"name": "Shoes", "image_url": "/custom-shoe.png"}],
                "style_agent": "Pairing a stylish tie-top with tailored trousers gives an effortless evening silhouette.",
                "finance_agent": "Investing in a statement top breathes new life into your standard evening trousers."
            }
        ]

    # 2. Dynamic generation using Gemini
    gemini_key = os.environ.get("GEMINI_API_KEY")

    # Determine upcoming weather for greeting
    upcoming_weather_text = ""
    forecast_list = weather.get('forecast', [])
    if len(forecast_list) >= 3:
        target_day = forecast_list[2]
        # format date roughly (e.g. "08-15")
        short_date = target_day['date'][5:]
        upcoming_weather_text = f"Heads up! Around {short_date}, expect {target_day['max_temp']}°C and {target_day['description'].lower()}. Order today to have the perfect outfit ready!"
    else:
        upcoming_weather_text = f"Morning! It's a {weather.get('conditions', 'pleasant')} {weather.get('temperature', '')}°C weekend ahead."

    # Default fallback data
    final_data = {
        "greeting": upcoming_weather_text,
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
            5-Day Weather Forecast: {json.dumps(weather.get('forecast', []))}
            Upcoming Events (Next 7 days): {json.dumps(events)}
            Trending locally: {trends['trending_items']}
            
            Generate a JSON response containing the daily feed for the user. 
            CRITICAL RULES:
            - Your recommendations MUST heavily incorporate the Current Weather and 5-Day Forecast. Suggest breathable/light fabrics for heat, layering for cold, rain-safe gear if raining, etc. Match the outfit to the specific day's weather and event.
            - Deeply consider the User's Location ({location_str}) and its local cultural fashion preferences. For example, if in Lucknow, prioritize Chikankari or traditional wear; if in Jaipur, suggest Bandhani; if in Bengaluru, suggest tech-casual or smart-casual streetwear; if in Delhi, suggest trendy, layered, or bold outfits fitting the local vibe.
            - The `description` and `style_agent` fields MUST be highly personalized, high-quality, and conversational. 
            - You MUST explicitly name-drop the cultural fabric or style (e.g. "Chikankari", "Bandhani", "Breathable Linen") if it matches the location and event. 
            - You MUST explicitly explain how the outfit handles the specific weather condition and temperature for that day.
            - Output MUST be valid JSON, with NO markdown formatting (no ```json).
            
            Format required:
            {{
                "greeting": "{upcoming_weather_text}",
                "location": "{location_str}",
                "weather": {{
                    "temp": "{weather['temperature']}°C",
                    "description": "{weather['description']}"
                }},
                "forecast": {json.dumps(weather.get('forecast', []))},
                "events": {json.dumps(events)},
                "outfits_heading": "Looks curated for your calendar events:",
                "outfits": [
                    {{
                        "title": "Short title (e.g. Traditional Wedding Guest)",
                        "tag": "Best for [Event Date]",
                        "description": "Engaging description explaining why this cultural/style choice is perfect for the event and weather.",
                        "items": [
                            {{"name": "Item Name", "image_url": "/path/to/image.png"}}
                        ],
                        "style_agent": "A conversational note from the stylist explaining the fabric choice and cultural relevance.",
                        "finance_agent": "A brief note on cost-per-wear or investment value."
                    }}
                ]
            }}
            
            Ensure you create exactly {len(events) if events else 2} outfits corresponding directly to the Upcoming Events and weather. 
            For the 'image_url' fields, you MUST pick ONLY from this list of local assets based on the vibe of the outfit:
            - Traditional/Festive Tops: "/custom-yellow-suit.png", "/kurti-1.png", "/lehenga_.png"
            - Formal/Work Tops: "/meetingcptop.png", "/orange_tie_top.png"
            - Casual/Travel Tops: "/custom-top.png"
            - Bottoms: "/suitpant.png", "/custom-jeans.png"
            - Shoes: "/custom-shoe.png"
            - Accessories: "/custom-sunglasses.png"
            DO NOT use Unsplash URLs. Use ONLY the paths provided above to ensure images load correctly in the UI.
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
