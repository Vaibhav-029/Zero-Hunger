import math
import logging
from typing import List, Dict
from app.models import NGOMatchRequest, NGOMatchResponse, MatchDetail

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points on the earth."""
    R = 6371.0 # Earth radius in kilometers

    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    lat1 = math.radians(lat1)
    lat2 = math.radians(lat2)

    a = math.sin(dLat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dLon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def estimate_travel_time(distance_km: float) -> str:
    """Estimate travel time assuming an average urban speed of 20 km/h."""
    # Speed in km/h
    avg_speed = 20.0 
    hours = distance_km / avg_speed
    minutes = int(hours * 60)
    
    if minutes < 1:
        return "< 1 min"
    elif minutes < 60:
        return f"{minutes} mins"
    else:
        hrs = minutes // 60
        mins = minutes % 60
        return f"{hrs} hr {mins} mins"

def calculate_matching_score(distance_km: float, urgency_level: int, food_type: str, accepted_foods: List[str]) -> int:
    # 1. Distance Score
    if distance_km < 2:
        distance_score = 100
    elif distance_km < 5:
        distance_score = 70
    elif distance_km <= 10:
        distance_score = 40
    else:
        distance_score = 20
        
    # 2. Urgency Score
    urgency_score = urgency_level * 10
    
    # 3. Food Compatibility Score
    if food_type in accepted_foods:
        food_compatibility = 100
    else:
        food_compatibility = 0
        
    # Matching Score Formula
    matching_score_raw = (distance_score * 0.5) + (urgency_score * 0.3) + (food_compatibility * 0.2)
    return int(matching_score_raw)

def find_best_ngo_matches(request: NGOMatchRequest) -> NGOMatchResponse:
    donor = request.donor
    all_matches = []
    
    logger.info(f"Matching NGOs for donor: {donor.name} (Food: {donor.foodType}, Qty: {donor.quantityKg}kg)")

    for ngo in request.ngos:
        dist_km = haversine_distance(donor.latitude, donor.longitude, ngo.latitude, ngo.longitude)
        dist_km_rounded = round(dist_km, 2)
        travel_time = estimate_travel_time(dist_km)
        
        score = calculate_matching_score(dist_km, ngo.urgencyLevel, donor.foodType, ngo.acceptedFoods)
        
        # Confidence score simulation (just maps score directly to a percentage for MVP)
        confidence_pct = min(100, max(0, score))
        confidence_score_str = f"{confidence_pct}%"
        
        match_detail = MatchDetail(
            ngoName=ngo.name,
            distanceKm=dist_km_rounded,
            matchingScore=score,
            estimatedTravelTime=travel_time,
            confidenceScore=confidence_score_str
        )
        all_matches.append(match_detail)

    # Sort matches by score descending
    all_matches.sort(key=lambda x: x.matchingScore, reverse=True)
    
    # Filter for nearby/top matches
    best_match = all_matches[0] if all_matches else None
    top_matches = all_matches[:3] # Top 3 best matches as requested
    
    logger.info(f"Best match found: {best_match.ngoName if best_match else 'None'} with score {best_match.matchingScore if best_match else 0}")
    
    return NGOMatchResponse(
        bestMatch=best_match,
        topMatches=top_matches,
        allMatches=all_matches
    )
