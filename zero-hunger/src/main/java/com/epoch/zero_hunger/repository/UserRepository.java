package com.epoch.zero_hunger.repository;

import com.epoch.zero_hunger.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query to find user by username for the Login API
    Optional<User> findByUsername(String username);
}