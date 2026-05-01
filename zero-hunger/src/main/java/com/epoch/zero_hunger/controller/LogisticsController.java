package com.epoch.zero_hunger.controller;

import com.epoch.zero_hunger.model.Truck;
import com.epoch.zero_hunger.model.NgoRequest;
import com.epoch.zero_hunger.model.FoodDonation;
import com.epoch.zero_hunger.repository.TruckRepository;
import com.epoch.zero_hunger.repository.NgoRequestRepository;
import com.epoch.zero_hunger.repository.FoodDonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logistics")
@CrossOrigin(origins = "http://localhost:5173")
public class LogisticsController {

    @Autowired
    private TruckRepository truckRepository;

    @Autowired
    private NgoRequestRepository requestRepository;

    @Autowired
    private FoodDonationRepository foodRepository;

    // Task: GET /available-trucks
    @GetMapping("/trucks/available")
    public List<Truck> getAvailableTrucks() {
        return truckRepository.findByIsAvailableTrue();
    }

    // Task: POST /assign-truck
    @PostMapping("/assign")
    public Truck assignTruck(@RequestBody Truck truck) {
        truck.setIsAvailable(false); // Mark as busy for the current mission
        return truckRepository.save(truck);
    }

    // Task: POST /complete-delivery
    @PostMapping("/delivery/complete/{requestId}")
    public ResponseEntity<?> completeDelivery(@PathVariable Long requestId) {
        // 1. Find the request
        NgoRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // 2. Mark the request as DELIVERED
        request.setRequestStatus("DELIVERED");
        requestRepository.save(request);

        // 3. Update the Food status to DELIVERED
        FoodDonation food = request.getFoodDonation();
        food.setStatus("DELIVERED");
        foodRepository.save(food);

        // 4. Free up the truck for the next mission
        // Logic: We find the truck by the driver who was assigned to the food's donor/ngo
        // For a hackathon, we can simply find the truck by the driver ID in the system
        truckRepository.findByIsAvailableFalse().stream()
                .filter(t -> t.getDriver().getId().equals(request.getNgo().getId())) // Simplification
                .findFirst()
                .ifPresent(t -> {
                    t.setIsAvailable(true);
                    truckRepository.save(t);
                });

        return ResponseEntity.ok("{\"message\": \"Mission Accomplished! Food delivered and truck is now free.\"}");
    }
}