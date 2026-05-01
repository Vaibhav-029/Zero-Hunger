package com.epoch.zero_hunger.controller;

import com.epoch.zero_hunger.model.NgoRequest;
import com.epoch.zero_hunger.model.FoodDonation;
import com.epoch.zero_hunger.repository.NgoRequestRepository;
import com.epoch.zero_hunger.repository.FoodDonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "http://localhost:5173")
public class NgoRequestController {

    @Autowired
    private NgoRequestRepository requestRepository;

    @Autowired
    private FoodDonationRepository foodRepository;

    // Task: POST /request-food
    @PostMapping("/claim")
    public ResponseEntity<?> claimFood(@RequestBody NgoRequest request) {
        // 1. Fetch the EXISTING food donation from the database by its ID
        // This prevents overwriting existing details like foodName and quantity
        FoodDonation existingFood = foodRepository.findById(request.getFoodDonation().getId())
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        // 2. Set the relationship and initial status for the new request
        request.setFoodDonation(existingFood);
        request.setRequestStatus("PENDING");
        NgoRequest savedRequest = requestRepository.save(request);

        // 3. Update ONLY the status of the existing food item
        existingFood.setStatus("REQUESTED");
        foodRepository.save(existingFood);

        return ResponseEntity.ok(savedRequest);
    }

    // Task: GET /all-requests (For the Admin or Driver to see what needs moving)
    @GetMapping("/all")
    public List<NgoRequest> getAllRequests() {
        return requestRepository.findAll();
    }
}