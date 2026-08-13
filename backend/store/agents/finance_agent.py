def check_wardrobe_overlap(proposed_items, wardrobe_items):
    """
    Checks if the proposed items are too similar to what the user already owns.
    """
    warnings = []
    
    # Mocking logic based on user request
    for item in proposed_items:
        if item.get("category", "").lower() == "trouser" and item.get("fit") == "tapered":
            warnings.append({
                "type": "finance_balance",
                "message": "FINANCE BALANCE: Found a nearly identical premium style on Myntra for 30% less! A much smarter financial choice for your wallet.",
                "item": item
            })
            
    return warnings
