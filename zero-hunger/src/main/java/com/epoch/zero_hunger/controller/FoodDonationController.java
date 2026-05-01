package com.epoch.zero_hunger.controller;

import com.epoch.zero_hunger.model.FoodDonation;
import com.epoch.zero_hunger.repository.FoodDonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodDonationController {

    @Autowired
    private FoodDonationRepository foodRepository;

    // Task: POST /donate-food
    @PostMapping("/donate")
    public ResponseEntity<?> donateFood(@RequestBody FoodDonation donation) {
        donation.setStatus("AVAILABLE"); // Default status for new donations
        return ResponseEntity.ok(foodRepository.save(donation));
    }

    // Task: GET /all-food
    @GetMapping("/all")
    public List<FoodDonation> getAllFood() {
        return foodRepository.findAll();
    }

    @GetMapping("/urgent")
    public List<FoodDonation> getUrgentFood() {
        return foodRepository.findAllByOrderByExpiryTimeAsc();
    }
}