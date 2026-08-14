import os
import requests
from dotenv import load_dotenv

load_dotenv()

def get_forecast(location_name=None, lat=None, lon=None):
    """
    Fetches the weather forecast. Uses OpenWeatherMap Geocoding API if only location_name is provided.
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        try:
            if location_name and (lat is None or lon is None):
                # Geocode the location using open-meteo geocoding
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={location_name}&count=1"
                geo_response = requests.get(geo_url)
                geo_response.raise_for_status()
                geo_data = geo_response.json()
                if geo_data and "results" in geo_data and len(geo_data["results"]) > 0:
                    lat = geo_data["results"][0]['latitude']
                    lon = geo_data["results"][0]['longitude']
                else:
                    return {"temperature": 24, "conditions": "sunny", "description": "Sunny (Fallback)", "forecast": []}

            # Fetch weather from open-meteo
            url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto"
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            
            temp = round(data["current_weather"]["temperature"])
            code = data["current_weather"]["weathercode"]
            
            def get_desc(c):
                if c in [1, 2, 3]: return "Partly Cloudy"
                elif c in [45, 48]: return "Foggy"
                elif c in [51, 53, 55, 61, 63, 65, 80, 81, 82]: return "Rain"
                elif c in [71, 73, 75, 85, 86]: return "Snow"
                elif c in [95, 96, 99]: return "Thunderstorm"
                return "Clear"
            
            desc = get_desc(code)
            
            forecast_5days = []
            if "daily" in data:
                for i in range(min(5, len(data["daily"]["time"]))):
                    daily_code = data["daily"]["weathercode"][i]
                    forecast_5days.append({
                        "date": data["daily"]["time"][i],
                        "max_temp": round(data["daily"]["temperature_2m_max"][i]),
                        "min_temp": round(data["daily"]["temperature_2m_min"][i]),
                        "conditions": get_desc(daily_code).lower(),
                        "description": get_desc(daily_code)
                    })
            
            return {
                "temperature": temp,
                "conditions": desc.lower(),
                "description": desc,
                "forecast": forecast_5days
            }
        except Exception as e:
            print(f"Error fetching open-meteo weather: {e}")
            return {"temperature": 24, "conditions": "sunny", "description": "Sunny (Fallback)", "forecast": []}

    try:
        if location_name and (lat is None or lon is None):
            # Geocode the location
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={location_name}&limit=1&appid={api_key}"
            geo_response = requests.get(geo_url)
            geo_response.raise_for_status()
            geo_data = geo_response.json()
            if geo_data:
                lat = geo_data[0]['lat']
                lon = geo_data[0]['lon']
            else:
                return {"temperature": 24, "conditions": "sunny", "description": "Sunny and clear", "forecast": []}

        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return {
            "temperature": round(data['main']['temp']),
            "conditions": data['weather'][0]['main'].lower(),
            "description": data['weather'][0]['description'].capitalize(),
            "forecast": []
        }
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return {"temperature": 24, "conditions": "sunny", "description": "Sunny and clear", "forecast": []}
