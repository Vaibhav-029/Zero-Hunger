package com.epoch.zero_hunger.controller;

import com.epoch.zero_hunger.model.FoodDonation;
import com.epoch.zero_hunger.model.User;
import com.epoch.zero_hunger.repository.FoodDonationRepository;
import com.epoch.zero_hunger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "http://localhost:5173")
public class FoodDonationController {

    @Autowired
    private FoodDonationRepository foodRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/donate")
    public ResponseEntity<?> donateFood(@RequestBody Map<String, Object> body) {
        Object donorIdObj = body.get("donorId");
        if (donorIdObj == null) {
            return ResponseEntity.badRequest().body("donorId is required");
        }
        long donorId = ((Number) donorIdObj).longValue();
        User donor = userRepository.findById(donorId)
                .orElseThrow(() -> new RuntimeException("Donor not found"));

        FoodDonation donation = new FoodDonation();
        donation.setDonor(donor);
        donation.setFoodName(String.valueOf(body.get("foodName")));
        donation.setQuantity(String.valueOf(body.get("quantity")));
        donation.setExpiryTime(parseExpiryTime(String.valueOf(body.get("expiryTime"))));
        donation.setStatus("AVAILABLE");
        return ResponseEntity.ok(foodRepository.save(donation));
    }

    private LocalDateTime parseExpiryTime(String raw) {
        if (raw == null || raw.isBlank() || "null".equals(raw)) {
            return LocalDateTime.now(ZoneOffset.UTC).plusHours(24);
        }
        return Instant.parse(raw).atZone(ZoneOffset.UTC).toLocalDateTime();
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