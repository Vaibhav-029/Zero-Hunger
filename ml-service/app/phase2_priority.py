from app.models import PriorityPredictionRequest, PriorityPredictionResponse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def calculate_urgency_priority(request: PriorityPredictionRequest) -> PriorityPredictionResponse:
    logger.info(f"Calculating priority for: {request.foodType}")
    
    # 1. Expiry Score Calculation
    if request.safeHoursRemaining < 2:
        expiry_score = 10
    elif request.safeHoursRemaining < 4:
        expiry_score = 8
    elif request.safeHoursRemaining < 8:
        expiry_score = 5
    else:
        expiry_score = 2
        
    # 2. Distance Score Calculation
    if request.distanceToNGO < 2:
        distance_score = 10
    elif request.distanceToNGO < 5:
        distance_score = 7
    elif request.distanceToNGO < 10:
        distance_score = 5
    else:
        distance_score = 2
        
    # 3. Quantity Score Calculation
    if request.foodQuantityKg > 20:
        quantity_score = 10
    elif request.foodQuantityKg > 10:
        quantity_score = 7
    elif request.foodQuantityKg > 5:
        quantity_score = 5
    else:
        quantity_score = 2
        
    # 4. NGO Urgency
    ngo_urgency = request.ngoUrgency # Already 1-10
    
    # 5. Priority Formula
    # priorityScore = (expiryScore * 0.4) + (distanceScore * 0.3) + (ngoUrgency * 0.2) + (quantityScore * 0.1)
    priority_score_raw = (expiry_score * 0.4) + (distance_score * 0.3) + (ngo_urgency * 0.2) + (quantity_score * 0.1)
    
    # Scale raw score (max possible is 10) to a 0-100 scale for intuitive ranking
    priority_score = int((priority_score_raw / 10.0) * 100)
    
    logger.info(f"Scores -> Expiry: {expiry_score}, Distance: {distance_score}, Quantity: {quantity_score}, NGO: {ngo_urgency}")
    logger.info(f"Raw Weighted: {priority_score_raw}, Scaled Score: {priority_score}")
    
    # 6. Priority Categories & Recommendations
    if priority_score > 85:
        category = "CRITICAL"
        action = "Assign nearest truck immediately"
    elif priority_score > 65:
        category = "HIGH"
        action = "Immediate pickup required"
    elif priority_score > 40:
        category = "MEDIUM"
        action = "Schedule for pickup in the next delivery window"
    else:
        category = "LOW"
        action = "Safe for scheduled pickup or monitor for spoilage escalation"
        
    return PriorityPredictionResponse(
        foodType=request.foodType,
        priorityScore=priority_score,
        priorityCategory=category,
        recommendedAction=action
    )
