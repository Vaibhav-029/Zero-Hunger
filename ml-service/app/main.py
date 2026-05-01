from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import (
    SpoilagePredictionRequest, SpoilagePredictionResponse,
    PriorityPredictionRequest, PriorityPredictionResponse,
    NGOMatchRequest, NGOMatchResponse,
    AssignTruckRequest, AssignTruckResponse,
    OptimizeLiveRouteRequest, OptimizeLiveRouteResponse
)
from app.phase1_spoilage import analyze_spoilage
from app.phase2_priority import calculate_urgency_priority
from app.phase3_matching import find_best_ngo_matches
from app.phase4_routing import calculate_assignment
from app.phase5_dynamic_routing import optimize_dynamic_route

app = FastAPI(
    title="FoodRescue AI - Spoilage Prediction Engine",
    description="Phase 1 API for predicting food expiry, spoilage risk, and urgency.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "Spoilage Prediction Engine is running smoothly"}

@app.post(
    "/predict-spoilage",
    response_model=SpoilagePredictionResponse,
    summary="Predict Food Spoilage",
    description="Calculates safe hours remaining, spoilage risk, and priority level based on food type, temperature, and storage conditions."
)
def predict_spoilage_endpoint(request: SpoilagePredictionRequest):
    try:
        response = analyze_spoilage(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing spoilage: {str(e)}")

@app.post(
    "/calculate-priority",
    response_model=PriorityPredictionResponse,
    summary="Calculate Rescue Priority",
    description="Calculates a priority score based on food expiry, distance, quantity, and NGO urgency."
)
def calculate_priority_endpoint(request: PriorityPredictionRequest):
    try:
        response = calculate_urgency_priority(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating priority: {str(e)}")

@app.post(
    "/match-ngo",
    response_model=NGOMatchResponse,
    summary="Match Donor with Best NGO",
    description="Calculates distances and matching scores to recommend the best NGO for a food donation."
)
def match_ngo_endpoint(request: NGOMatchRequest):
    if not request.ngos:
        raise HTTPException(status_code=400, detail="NGO list cannot be empty.")
        
    try:
        response = find_best_ngo_matches(request)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error matching NGOs: {str(e)}")

@app.post(
    "/assign-truck",
    response_model=AssignTruckResponse,
    summary="Assign Truck & Optimize Delivery Route",
    description="Intelligently assigns the best delivery truck, optimizes the pickup route, and estimates ETAs."
)
def assign_truck_endpoint(request: AssignTruckRequest):
    if not request.trucks:
        raise HTTPException(status_code=400, detail="Trucks list cannot be empty.")
    if not request.donations:
        raise HTTPException(status_code=400, detail="Donations list cannot be empty.")
        
    try:
        response = calculate_assignment(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during route optimization: {str(e)}")

@app.post(
    "/optimize-live-route",
    response_model=OptimizeLiveRouteResponse,
    summary="Optimize Live Route (Phase 5)",
    description="Real-time route optimization using OR-Tools, incorporating dynamic truck routing, multi-stop pickup, and traffic ETA simulation."
)
def optimize_live_route_endpoint(request: OptimizeLiveRouteRequest):
    if not request.donations:
        raise HTTPException(status_code=400, detail="Donations list cannot be empty.")
        
    try:
        response = optimize_dynamic_route(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during real-time route optimization: {str(e)}")

# Run command instruction:
# uvicorn app.main:app --reload
