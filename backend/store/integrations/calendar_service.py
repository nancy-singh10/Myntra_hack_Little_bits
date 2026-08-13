import datetime

def get_upcoming_events(user, location_str=""):
    """
    Fetches upcoming events for the user.
    """
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
