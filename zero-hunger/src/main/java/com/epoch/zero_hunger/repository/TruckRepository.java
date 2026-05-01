package com.epoch.zero_hunger.repository;

import com.epoch.zero_hunger.model.Truck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TruckRepository extends JpaRepository<Truck, Long> {
    // This allows you to find trucks that are ready for a mission
    List<Truck> findByIsAvailableTrue();

    // This allows you to find trucks currently out on a delivery (fixes your error)
    List<Truck> findByIsAvailableFalse();
}