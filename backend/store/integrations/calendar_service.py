import datetime
import requests
from icalendar import Calendar

def get_upcoming_events(user, location_str="", ical_url=None):
    """
    Fetches upcoming events for the user.
    If ical_url is provided, it parses the iCal feed.
    Otherwise, it falls back to mock data based on location.
    """
    if not ical_url:
        ical_url = "https://calendar.google.com/calendar/ical/nancysingh0526%40gmail.com/private-0bd9438fbff5f2d571a029940a12df9c/basic.ics"

    if ical_url:
        try:
            response = requests.get(ical_url)
            response.raise_for_status()
            cal = Calendar.from_ical(response.content)
            
            events = []
            now = datetime.datetime.now(datetime.timezone.utc)
            future_limit = now + datetime.timedelta(days=7)
            
            for component in cal.walk():
                if component.name == "VEVENT":
                    dtstart = component.get('dtstart')
                    if dtstart:
                        event_date = dtstart.dt
                        
                        if type(event_date) is datetime.date:
                            event_datetime = datetime.datetime.combine(event_date, datetime.time.min).replace(tzinfo=datetime.timezone.utc)
                        else:
                            event_datetime = event_date
                            if event_datetime.tzinfo is None:
                                event_datetime = event_datetime.replace(tzinfo=datetime.timezone.utc)
                        
                        if now <= event_datetime <= future_limit:
                            events.append({
                                "title": str(component.get('summary')),
                                "date": event_datetime.strftime("%Y-%m-%d"),
                                "time": event_datetime.strftime("%H:%M") if type(event_date) is not datetime.date else "All Day",
                                "type": "personal",
                                "_dt": event_datetime
                            })
                            
            events.sort(key=lambda x: x["_dt"])
            for e in events:
                del e["_dt"]
            
            if events:
                return events[:5]
        except Exception as e:
            print(f"Error fetching/parsing iCal: {e}")
            pass

    loc_lower = location_str.lower() if location_str else ""
    events = []
    
    if "lucknow" in loc_lower:
        events = [
            {
                "title": "Family Cultural Gathering",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "11:00",
                "type": "cultural"
            },
            {
                "title": "Dinner at Hazratganj",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "19:00",
                "type": "social"
            }
        ]
    elif "delhi" in loc_lower:
        events = [
            {
                "title": "Client Meeting, CP",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "14:00",
                "type": "professional"
            },
            {
                "title": "Dinner in Hauz Khas",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "20:00",
                "type": "social"
            }
        ]
    elif "london" in loc_lower:
        events = [
            {
                "title": "Board review",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "14:00",
                "type": "professional"
            },
            {
                "title": "Dinner, Soho",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "19:30",
                "type": "social"
            }
        ]
    elif "mumbai" in loc_lower:
        events = [
            {
                "title": "Beachfront Dinner",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "19:00",
                "type": "personal"
            },
            {
                "title": "Ganesh Chaturthi Prep",
                "date": (datetime.datetime.now() + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
                "time": "All Day",
                "type": "cultural"
            }
        ]
    else:
        events = [
            {
                "title": "Friend's Haldi Ceremony",
                "date": (datetime.datetime.now() + datetime.timedelta(days=1)).strftime("%Y-%m-%d"),
                "time": "10:00",
                "type": "personal"
            },
            {
                "title": "Varamahalakshmi Festival",
                "date": (datetime.datetime.now() + datetime.timedelta(days=2)).strftime("%Y-%m-%d"),
                "time": "All Day",
                "type": "cultural"
            },
            {
                "title": "Outdoor Music Festival",
                "date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "time": "15:00",
                "type": "social"
            }
        ]
    return events
