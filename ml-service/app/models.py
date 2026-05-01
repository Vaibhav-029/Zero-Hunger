from pydantic import BaseModel, Field
from typing import List, Optional

class SpoilagePredictionRequest(BaseModel):
    foodType: str = Field(..., description="Type of food (e.g., Cooked Rice, Bread, Milk)")
    preparedHoursAgo: float = Field(..., description="Hours since the food was prepared or packaged")
    temperature: float = Field(..., description="Current storage temperature in Celsius")
    storageCondition: str = Field(..., description="Storage condition (e.g., Room Temperature, Refrigerated)")
    packaged: bool = Field(..., description="Whether the food is in sealed packaging")

    class Config:
        json_schema_extra = {
            "example": {
                "foodType": "Cooked Rice",
                "preparedHoursAgo": 2,
                "temperature": 32,
                "storageCondition": "Room Temperature",
                "packaged": False
            }
        }

class SpoilagePredictionResponse(BaseModel):
    foodType: str
    safeHoursRemaining: float
    spoilageRisk: str
    priorityLevel: str
    recommendation: str

# ==========================================
# PHASE 2: Priority Engine Models
# ==========================================
class PriorityPredictionRequest(BaseModel):
    foodType: str = Field(..., description="Type of food (e.g., Cooked Rice, Bread)")
    safeHoursRemaining: float = Field(..., ge=0.0, description="Remaining safe hours for consumption")
    distanceToNGO: float = Field(..., ge=0.0, description="Distance to the nearest NGO in kilometers")
    ngoUrgency: int = Field(..., ge=1, le=10, description="Urgency of the NGO request (1-10 scale)")
    foodQuantityKg: float = Field(..., gt=0.0, description="Quantity of food in kilograms")

    class Config:
        json_schema_extra = {
            "example": {
                "foodType": "Cooked Rice",
                "safeHoursRemaining": 1.5,
                "distanceToNGO": 2.3,
                "ngoUrgency": 9,
                "foodQuantityKg": 12.0
            }
        }

class PriorityPredictionResponse(BaseModel):
    foodType: str
    priorityScore: int
    priorityCategory: str
    recommendedAction: str

# ==========================================
# PHASE 3: NGO Matching Engine Models
# ==========================================
class DonorModel(BaseModel):
    name: str = Field(..., description="Name of the donor")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the donor")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the donor")
    foodType: str = Field(..., description="Type of food being donated")
    quantityKg: float = Field(..., ge=0.0, description="Quantity of food in kilograms")

class NGOModel(BaseModel):
    name: str = Field(..., description="Name of the NGO")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude of the NGO")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude of the NGO")
    urgencyLevel: int = Field(..., ge=1, le=10, description="Urgency of the NGO request (1-10)")
    acceptedFoods: List[str] = Field(..., description="List of food types accepted by the NGO")

class NGOMatchRequest(BaseModel):
    donor: DonorModel
    ngos: List[NGOModel] = Field(..., min_length=1, description="List of potential NGOs")

    class Config:
        json_schema_extra = {
            "example": {
                "donor": {
                    "name": "College Hostel Mess",
                    "latitude": 12.9716,
                    "longitude": 77.5946,
                    "foodType": "Cooked Rice",
                    "quantityKg": 15.0
                },
                "ngos": [
                    {
                        "name": "Hope Shelter",
                        "latitude": 12.9750,
                        "longitude": 77.5990,
                        "urgencyLevel": 9,
                        "acceptedFoods": ["Cooked Rice", "Bread"]
                    },
                    {
                        "name": "Care Foundation",
                        "latitude": 12.9650,
                        "longitude": 77.5800,
                        "urgencyLevel": 6,
                        "acceptedFoods": ["Packed Food", "Vegetables"]
                    }
                ]
            }
        }

class MatchDetail(BaseModel):
    ngoName: str
    distanceKm: float
    matchingScore: int
    estimatedTravelTime: Optional[str] = None
    confidenceScore: Optional[str] = None

class NGOMatchResponse(BaseModel):
    bestMatch: MatchDetail
    topMatches: List[MatchDetail]
    allMatches: List[MatchDetail]

# ==========================================
# PHASE 4: Delivery Optimization Models
# ==========================================
class DonationModel(BaseModel):
    id: int
    donorName: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    quantityKg: float = Field(..., gt=0.0)
    priorityScore: int
    safeHoursRemaining: float = Field(..., ge=0.0)

class TruckModel(BaseModel):
    truckId: str
    currentLatitude: float = Field(..., ge=-90.0, le=90.0)
    currentLongitude: float = Field(..., ge=-180.0, le=180.0)
    capacityKg: float = Field(..., gt=0.0)
    available: bool

class SimpleNGOModel(BaseModel):
    name: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class AssignTruckRequest(BaseModel):
    donations: List[DonationModel] = Field(..., min_length=1)
    trucks: List[TruckModel] = Field(..., min_length=1)
    ngo: SimpleNGOModel

    class Config:
        json_schema_extra = {
            "example": {
                "donations": [
                    {"id": 1, "donorName": "College Hostel Mess", "latitude": 12.9716, "longitude": 77.5946, "quantityKg": 10, "priorityScore": 92, "safeHoursRemaining": 1.5},
                    {"id": 2, "donorName": "Local Bakery", "latitude": 12.9750, "longitude": 77.5980, "quantityKg": 5, "priorityScore": 75, "safeHoursRemaining": 4}
                ],
                "trucks": [
                    {"truckId": "TRUCK-1", "currentLatitude": 12.9690, "currentLongitude": 77.5900, "capacityKg": 30, "available": True}
                ],
                "ngo": {
                    "name": "Hope Shelter", "latitude": 12.9800, "longitude": 77.6000
                }
            }
        }

class DeliveryDetail(BaseModel):
    donationId: int
    pickupPriority: int
    eta: str

class AssignTruckResponse(BaseModel):
    assignedTruck: str
    optimizedRoute: List[str]
    totalDistanceKm: float
    estimatedTime: str
    deliveryEfficiency: str
    confidenceScore: str
    deliveries: List[DeliveryDetail]

# ==========================================
# PHASE 5: Real-Time Dynamic Routing Models
# ==========================================
class LiveTruckModel(BaseModel):
    truckId: str
    currentLatitude: float = Field(..., ge=-90.0, le=90.0)
    currentLongitude: float = Field(..., ge=-180.0, le=180.0)
    capacityKg: float = Field(..., gt=0.0)

class LiveDonationModel(BaseModel):
    donationId: int
    donorName: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    priorityScore: int
    safeHoursRemaining: float = Field(..., ge=0.0)
    quantityKg: float = Field(..., gt=0.0)

class LiveNGOModel(BaseModel):
    ngoName: str
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)

class OptimizeLiveRouteRequest(BaseModel):
    truck: LiveTruckModel
    donations: List[LiveDonationModel] = Field(..., min_length=1)
    ngo: LiveNGOModel

    class Config:
        json_schema_extra = {
            "example": {
                "truck": {
                    "truckId": "TRUCK-1",
                    "currentLatitude": 12.9716,
                    "currentLongitude": 77.5946,
                    "capacityKg": 40
                },
                "donations": [
                    {
                        "donationId": 1,
                        "donorName": "College Hostel Mess",
                        "latitude": 12.9750,
                        "longitude": 77.5980,
                        "priorityScore": 92,
                        "safeHoursRemaining": 1.5,
                        "quantityKg": 10
                    },
                    {
                        "donationId": 2,
                        "donorName": "Local Bakery",
                        "latitude": 12.9790,
                        "longitude": 77.6010,
                        "priorityScore": 74,
                        "safeHoursRemaining": 4,
                        "quantityKg": 5
                    }
                ],
                "ngo": {
                    "ngoName": "Hope Shelter",
                    "latitude": 12.9820,
                    "longitude": 77.6050
                }
            }
        }

class RouteStop(BaseModel):
    stop: str
    type: str
    eta: str

class OptimizeLiveRouteResponse(BaseModel):
    assignedTruck: str
    optimizedRoute: List[RouteStop]
    totalDistanceKm: float
    estimatedTotalTime: str
    deliveryEfficiency: str
    spoilageRiskReduction: str
