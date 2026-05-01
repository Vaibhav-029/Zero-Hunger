package com.epoch.zero_hunger.controller;

import com.epoch.zero_hunger.repository.FoodDonationRepository;
import com.epoch.zero_hunger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/impact")
@CrossOrigin(origins = "http://localhost:5173")
public class ImpactController {

    @Autowired
    private FoodDonationRepository foodRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public Map<String, Long> getImpactStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalDonations", foodRepository.count());
        stats.put("totalUsers", userRepository.count());
        // Mocking 'mealsSaved' logic: 1 donation ≈ 10 meals
        stats.put("mealsSaved", foodRepository.count() * 10);
        return stats;
    }
}