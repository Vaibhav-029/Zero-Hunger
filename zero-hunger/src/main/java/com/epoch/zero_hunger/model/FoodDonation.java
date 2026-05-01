package com.epoch.zero_hunger.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "food_donations")
public class FoodDonation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "donor_id")
    private User donor;

    private String foodName;
    private String quantity;
    private LocalDateTime expiryTime; // Key for the Expiry-Aware task
    private String status; // AVAILABLE, REQUESTED, DELIVERED
}