package com.epoch.zero_hunger.repository;

import com.epoch.zero_hunger.model.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {
    // Useful for the "GET /all-food" task to filter by status
    List<FoodDonation> findByStatus(String status);
    // This helps the NGO find the most urgent food first (Nearest Expiry)
    List<FoodDonation> findAllByOrderByExpiryTimeAsc();
}


