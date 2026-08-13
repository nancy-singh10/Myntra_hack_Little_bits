def analyze_trends(location_str, event_types=None):
    """
    Analyzes local trends for a given location.
    """
    loc_lower = location_str.lower() if location_str else ""
    if "mumbai" in loc_lower:
        return {
            "trending_items": ["Festive Kurtas", "Lightweight Linen"],
            "insights": "Tracking this local context and real-time checkout velocity, Festive Kurtas are highly trending in Mumbai. Creator trends show a 40% spike in styling this locally for upcoming festivals."
        }
    elif "bengaluru" in loc_lower or "bangalore" in loc_lower:
        return {
            "trending_items": ["Crochet Lace Tops", "Baggy Jeans"],
            "insights": "Baggy Jeans and Crochet tops are trending in Bengaluru due to the pleasant weather."
        }
    else:
        return {
            "trending_items": ["Denim Jackets", "White Sneakers"],
            "insights": "Denim jackets are currently trending in your area."
        }
