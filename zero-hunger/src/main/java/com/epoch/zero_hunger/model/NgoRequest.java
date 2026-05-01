package com.epoch.zero_hunger.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "ngo_requests")
public class NgoRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ngo_id")
    private User ngo;

    @ManyToOne
    @JoinColumn(name = "food_id")
    private FoodDonation foodDonation;

    private String requestStatus; // PENDING, APPROVED, REJECTED
}