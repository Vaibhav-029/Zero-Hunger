package com.epoch.zero_hunger.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "trucks")
public class Truck {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "driver_id")
    private User driver;

    private String truckNumber;
    private Boolean isAvailable;
}