package com.epoch.zero_hunger.controller;

import com.epoch.zero_hunger.model.User;
import com.epoch.zero_hunger.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Connects to your React frontend
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // Task: POST /register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    // Task: POST /login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        Optional<User> user = userRepository.findByUsername(loginRequest.getUsername());

        if (user.isPresent() && user.get().getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.ok(user.get()); // Return the user object (including their role)
        }

        return ResponseEntity.status(401).body("Error: Invalid username or password");
    }
}