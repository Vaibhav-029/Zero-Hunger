import math
from typing import List, Tuple
from fastapi import HTTPException
from app.models import OptimizeLiveRouteRequest, OptimizeLiveRouteResponse, RouteStop
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance between two points on the earth (specified in decimal degrees) in km."""
    # Convert decimal degrees to radians 
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    # Haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a)) 
    # Radius of earth in kilometers is 6371
    km = 6371 * c
    return km

def create_data_model(request: OptimizeLiveRouteRequest):
    """
    Creates the data model for the routing problem.
    Node 0: Truck
    Node 1..N: Donations
    Node N+1: NGO
    """
    data = {}
    
    locations = []
    # Index 0: Truck
    locations.append((request.truck.currentLatitude, request.truck.currentLongitude))
    
    # Index 1..N: Donations
    for donation in request.donations:
        locations.append((donation.latitude, donation.longitude))
        
    # Index N+1: NGO
    locations.append((request.ngo.latitude, request.ngo.longitude))
    
    num_nodes = len(locations)
    data['distance_matrix'] = [[0] * num_nodes for _ in range(num_nodes)]
    
    # Calculate distances
    # Scale by 1000 to convert to integers for OR-Tools
    SCALE = 1000
    
    for i in range(num_nodes):
        for j in range(num_nodes):
            if i != j:
                dist_km = calculate_haversine_distance(
                    locations[i][0], locations[i][1],
                    locations[j][0], locations[j][1]
                )
                
                # We can adjust weight based on priority if the destination is a donation
                # but standard VRP minimizes distance. Let's incorporate priority:
                # If j is a donation (1 <= j <= len(donations))
                weight = dist_km
                if 1 <= j <= len(request.donations):
                    donation = request.donations[j-1]
                    # Higher priority should reduce the "cost" (weight) of visiting it,
                    # pulling the truck there earlier.
                    # e.g., if priorityScore is 100 (max), we reduce weight
                    priority_factor = max(0.1, 1.0 - (donation.priorityScore / 200.0))
                    weight = weight * priority_factor
                
                data['distance_matrix'][i][j] = int(weight * SCALE)
            else:
                data['distance_matrix'][i][j] = 0
                
    data['num_vehicles'] = 1
    # Start at Node 0 (Truck), End at Node N+1 (NGO)
    data['starts'] = [0]
    data['ends'] = [num_nodes - 1]
    
    return data, locations

def nearest_neighbor_fallback(request: OptimizeLiveRouteRequest):
    """
    Fallback method in case OR-Tools fails. 
    Orders donations by distance + priority weight.
    """
    current_lat = request.truck.currentLatitude
    current_lon = request.truck.currentLongitude
    
    unvisited = request.donations.copy()
    route = []
    total_dist = 0.0
    current_time_mins = 0
    SPEED_KMH = 40
    
    while unvisited:
        best_idx = -1
        best_score = float('inf')
        best_dist = 0
        
        for i, donation in enumerate(unvisited):
            dist = calculate_haversine_distance(current_lat, current_lon, donation.latitude, donation.longitude)
            # Score = distance - (priority * small factor) -> lower is better
            score = dist - (donation.priorityScore * 0.05)
            if score < best_score:
                best_score = score
                best_idx = i
                best_dist = dist
                
        # Visit best
        next_donation = unvisited.pop(best_idx)
        total_dist += best_dist
        current_time_mins += int((best_dist / SPEED_KMH) * 60)
        
        # Adding some pickup delay
        current_time_mins += 5 
        
        route.append(RouteStop(
            stop=next_donation.donorName,
            type="pickup",
            eta=f"{current_time_mins} mins"
        ))
        
        current_lat = next_donation.latitude
        current_lon = next_donation.longitude
        
    # Finally go to NGO
    dist_to_ngo = calculate_haversine_distance(current_lat, current_lon, request.ngo.latitude, request.ngo.longitude)
    total_dist += dist_to_ngo
    current_time_mins += int((dist_to_ngo / SPEED_KMH) * 60)
    
    route.append(RouteStop(
        stop=request.ngo.ngoName,
        type="delivery",
        eta=f"{current_time_mins} mins"
    ))
    
    # Metrics
    eff = min(99, 80 + int((request.truck.capacityKg / max(sum([d.quantityKg for d in request.donations]), 1)) * 10))
    eff_str = f"{eff}%"
    risk = min(99, 70 + int((len(request.donations) * 5)))
    risk_str = f"{risk}%"
    
    return OptimizeLiveRouteResponse(
        assignedTruck=request.truck.truckId,
        optimizedRoute=route,
        totalDistanceKm=round(total_dist, 2),
        estimatedTotalTime=f"{current_time_mins} mins",
        deliveryEfficiency=eff_str,
        spoilageRiskReduction=risk_str
    )

def optimize_dynamic_route(request: OptimizeLiveRouteRequest) -> OptimizeLiveRouteResponse:
    # 1. Total quantity check
    total_qty = sum([d.quantityKg for d in request.donations])
    if total_qty > request.truck.capacityKg:
        raise HTTPException(status_code=400, detail="Total donation quantity exceeds truck capacity.")
        
    # 2. Setup OR-Tools Model
    data, locations = create_data_model(request)
    
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']), data['num_vehicles'], data['starts'], data['ends'])
    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):
        # Returns the distance between the two nodes
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # 3. Add priority disjunctions or penalties if needed
    # We implicitly handled it in the distance matrix by lowering weight for high priority

    # 4. Solve
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        # Fallback if OR-Tools fails for some reason
        return nearest_neighbor_fallback(request)
        
    # 5. Extract route
    index = routing.Start(0)
    route_nodes = []
    while not routing.IsEnd(index):
        route_nodes.append(manager.IndexToNode(index))
        index = solution.Value(routing.NextVar(index))
    route_nodes.append(manager.IndexToNode(index))
    
    # route_nodes is like [0, 2, 1, 3] (Truck, Don2, Don1, NGO)
    
    optimized_route = []
    total_dist_km = 0.0
    current_time_mins = 0
    SPEED_KMH = 40  # average city speed
    
    for i in range(1, len(route_nodes)):
        prev_node = route_nodes[i-1]
        curr_node = route_nodes[i]
        
        # Calculate true haversine distance for ETA, ignore the weighted distance
        dist_km = calculate_haversine_distance(
            locations[prev_node][0], locations[prev_node][1],
            locations[curr_node][0], locations[curr_node][1]
        )
        total_dist_km += dist_km
        
        # 40 km/h -> 1.5 mins per km
        travel_time = int((dist_km / SPEED_KMH) * 60)
        
        # Add traffic delay simulation (e.g. + 2-5 mins random or based on distance)
        traffic_delay = max(1, int(dist_km * 0.5))
        
        current_time_mins += travel_time + traffic_delay
        
        if curr_node != len(locations) - 1:
            # It's a donation pickup
            donation = request.donations[curr_node - 1]
            # Add loading time (e.g., 5 mins)
            current_time_mins += 5
            optimized_route.append(RouteStop(
                stop=donation.donorName,
                type="pickup",
                eta=f"{current_time_mins} mins"
            ))
        else:
            # It's the NGO
            optimized_route.append(RouteStop(
                stop=request.ngo.ngoName,
                type="delivery",
                eta=f"{current_time_mins} mins"
            ))
            
    # Calculate some metrics
    delivery_eff = min(100, int(90 + (total_qty / request.truck.capacityKg) * 10))
    spoilage_risk = 85 + min(10, len(request.donations) * 2)
    
    return OptimizeLiveRouteResponse(
        assignedTruck=request.truck.truckId,
        optimizedRoute=optimized_route,
        totalDistanceKm=round(total_dist_km, 2),
        estimatedTotalTime=f"{current_time_mins} mins",
        deliveryEfficiency=f"{delivery_eff}%",
        spoilageRiskReduction=f"{spoilage_risk}%"
    )
