package com.epoch.zero_hunger.config;

import com.epoch.zero_hunger.model.User;
import com.epoch.zero_hunger.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedUser("donor", "donor123", "DONOR");
        seedUser("ngo", "ngo123", "NGO");
        seedUser("driver", "driver123", "DRIVER");
    }

    private void seedUser(String username, String password, String role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(password);
            user.setRole(role);
            userRepository.save(user);
        }
    }
}
