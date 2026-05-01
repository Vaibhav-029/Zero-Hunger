package com.epoch.zero_hunger.repository;

import com.epoch.zero_hunger.model.NgoRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NgoRequestRepository extends JpaRepository<NgoRequest, Long> {
}