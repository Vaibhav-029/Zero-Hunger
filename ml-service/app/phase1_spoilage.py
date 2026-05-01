from app.models import SpoilagePredictionRequest, SpoilagePredictionResponse

# Base shelf life rules in hours
BASE_SHELF_LIFE = {
    "Cooked Rice": 4.0,
    "Bread": 12.0,
    "Packed Food": 24.0,
    "Milk": 6.0,
    "Vegetables": 8.0,
    "Bakery": 12.0,
    "Fruits": 10.0,
    "Curry": 6.0
}

def analyze_spoilage(request: SpoilagePredictionRequest) -> SpoilagePredictionResponse:
    # 1. Start with base shelf life
    # Default to 12 hours if food type is completely unknown
    shelf_life = BASE_SHELF_LIFE.get(request.foodType, 12.0)
    
    # 2. Reduce shelf life based on temperature
    if request.temperature > 35:
        shelf_life *= 0.60  # Reduce by 40%
    elif 30 <= request.temperature <= 35:
        shelf_life *= 0.75  # Reduce by 25%
        
    # 3. Refrigerated storage increases shelf life
    # Assuming standard hackathon logic: if refrigerated, increase by 50%
    if request.storageCondition.lower() in ["refrigerated", "fridge", "cold storage"]:
        shelf_life *= 1.50
        
    # 4. Packaged food slightly increases shelf life
    # Increase by 20% if packaged
    if request.packaged:
        shelf_life *= 1.20
        
    # 5. Subtract preparedHoursAgo from total shelf life
    safe_hours_remaining = shelf_life - request.preparedHoursAgo
    
    # Ensure it doesn't go below 0
    safe_hours_remaining = max(0.0, round(safe_hours_remaining, 1))
    
    # Determine Risk Levels
    if safe_hours_remaining > 8.0:
        spoilage_risk = "LOW"
    elif 4.0 <= safe_hours_remaining <= 8.0:
        spoilage_risk = "MEDIUM"
    elif 2.0 <= safe_hours_remaining < 4.0:
        spoilage_risk = "HIGH"
    else:  # < 2 hrs
        spoilage_risk = "CRITICAL"
        
    # Determine Priority Levels based on risk
    if spoilage_risk == "LOW":
        priority_level = "SAFE"
        recommendation = "Can be stored for standard distribution."
    elif spoilage_risk == "MEDIUM":
        priority_level = "WARNING"
        recommendation = "Schedule for distribution soon."
    elif spoilage_risk == "HIGH":
        priority_level = "HIGH PRIORITY"
        recommendation = "Needs to be picked up in the next few hours."
    else:
        priority_level = "URGENT"
        recommendation = "Immediate pickup required or must be discarded soon."
        
    return SpoilagePredictionResponse(
        foodType=request.foodType,
        safeHoursRemaining=safe_hours_remaining,
        spoilageRisk=spoilage_risk,
        priorityLevel=priority_level,
        recommendation=recommendation
    )
