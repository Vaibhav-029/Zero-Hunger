# FoodRescue AI - Architecture & Implementation Overview

This document provides a comprehensive breakdown of the FoodRescue AI Engine, detailing all five operational phases, the underlying data models, and how the system is used. 

The system is built as a highly modular, AI-powered logistics routing engine using **FastAPI** and **Python**. It solves the complex problem of matching perishable food donations with NGOs and dynamically routing delivery trucks to minimize spoilage and maximize efficiency.

---

## Architecture Overview

The backend is structured into five distinct phases, exposed via RESTful endpoints. All inputs and outputs are strictly validated using **Pydantic** models to ensure data integrity.

### The 5 Phases of the Pipeline

#### **Phase 1: Spoilage Prediction Engine** (`app/phase1_spoilage.py`)
- **Goal:** Assess the safety of donated food.
- **How it Works:** It takes the food type, time since preparation, and storage conditions (temperature, packaging) to predict how long the food will remain safe for consumption.
- **Usage:** Helps the system immediately reject food that is already spoiled or flag food that is dangerously close to spoiling for immediate priority routing.
- **Endpoint:** `POST /predict-spoilage`

#### **Phase 2: Priority & Urgency Calculation** (`app/phase2_priority.py`)
- **Goal:** Determine which food donations need to be picked up first.
- **How it Works:** Uses a weighted scoring algorithm that evaluates the remaining safe hours (from Phase 1), the distance to the nearest NGO, the quantity of food, and the declared urgency of the NGO. 
- **Usage:** Generates a `priorityScore` (0-100) that dictates the sorting order for the matching and routing engines.
- **Endpoint:** `POST /calculate-priority`

#### **Phase 3: NGO Matching Engine** (`app/phase3_matching.py`)
- **Goal:** Find the best destination (NGO) for a specific donation.
- **How it Works:** Evaluates a list of potential NGOs against the donor's location and the type of food being donated. It calculates geographic distances using Haversine formulas and checks if the NGO accepts the specific food type.
- **Usage:** Outputs a ranked list of the best NGOs, providing a `matchingScore` and estimated travel time for each.
- **Endpoint:** `POST /match-ngo`

#### **Phase 4: Delivery Assignment & Routing** (`app/phase4_routing.py`)
- **Goal:** Intelligently pair available trucks with pending donations and a target NGO.
- **How it Works:** Takes a pool of trucks and a list of donations. It checks truck capacities against donation weights, ensuring the selected truck can handle the load.
- **Usage:** Outputs an assignment mapping a specific truck to a delivery run, with basic sequential routing.
- **Endpoint:** `POST /assign-truck`

#### **Phase 5: Real-Time Dynamic Route Optimization** (`app/phase5_dynamic_routing.py`)
- **Goal:** Generate the absolute fastest, most efficient physical route for the driver to take, solving the Vehicle Routing Problem (VRP).
- **How it Works:** 
  - Uses **Google OR-Tools** to calculate the most efficient path starting from the truck's current live location, hitting all assigned donation pickups, and ending at the NGO.
  - Simulates real-world conditions by injecting average city speeds (40 km/h), traffic delays, and loading times (5 mins per stop) to generate accurate ETAs.
  - **Priority Injection:** High-priority donations (calculated in Phase 2) influence the route graph to ensure urgent food is picked up earlier.
  - **Fallback Logic:** If OR-Tools fails due to complex constraint collisions, the system seamlessly falls back to a custom Priority-Weighted Nearest-Neighbor algorithm to guarantee a route is always returned.
- **Endpoint:** `POST /optimize-live-route`

---

## Core Data Models (`app/models.py`)

The system relies heavily on **Pydantic** models to validate incoming JSON payloads. Here is how the most critical models function:

### 1. `SpoilagePredictionRequest`
Used in Phase 1. Captures `foodType`, `preparedHoursAgo`, `temperature`, and `storageCondition`. Ensures that negative hours or impossible temperatures are flagged before processing.

### 2. `PriorityPredictionRequest`
Used in Phase 2. Combines food data with NGO urgency (`ngoUrgency`: 1-10 scale) and distance metrics to generate the priority score.

### 3. `LiveDonationModel` & `LiveNGOModel` (Phase 5)
These models are used in the dynamic routing engine.
- **Donation Model:** Tracks exact GPS coordinates, `priorityScore`, `quantityKg`, and `safeHoursRemaining`.
- **NGO Model:** Tracks the destination's exact GPS coordinates.

### 4. `OptimizeLiveRouteRequest` & `OptimizeLiveRouteResponse`
The capstone models of the API. 
- **Request:** Accepts a single `LiveTruckModel`, an array of `LiveDonationModel`, and a `LiveNGOModel`.
- **Response:** Returns the `assignedTruck`, an array of `RouteStop` objects (which define whether the stop is a pickup or delivery and its specific ETA), and overall metrics like `deliveryEfficiency` and `spoilageRiskReduction`.

---

## How to Run & Use the System

1. **Start the Server:**
   Ensure you are in the `ml-service` directory and run:
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access the Documentation:**
   Open your browser and navigate to `http://127.0.0.1:8000/docs`. FastAPI automatically generates an interactive Swagger UI.

3. **Testing the Flow:**
   You can test the entire lifecycle directly from the Swagger UI:
   - *Step 1:* Send a mock food item to `/predict-spoilage` to see how many hours it has left.
   - *Step 2:* Send that data to `/calculate-priority` to get its priority score.
   - *Step 3:* Send multiple donations with varying priority scores to `/optimize-live-route` to see the AI engine dynamically sequence the truck's pickups to minimize driving time and prioritize urgent food.
