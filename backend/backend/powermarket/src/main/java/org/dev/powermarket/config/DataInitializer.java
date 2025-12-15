package org.dev.powermarket.config;

import org.dev.powermarket.domain.User;
import org.dev.powermarket.domain.enums.Role;
import org.dev.powermarket.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("Initializing default data...");


            // Create default users
            User adminUser = new User();
            adminUser.setFullName("Администратор");
            adminUser.setEmail("admin@company.com");
            adminUser.setPasswordHash(passwordEncoder.encode("admin123"));
            adminUser.setRole(Role.TENANT);
            userRepository.save(adminUser);

            System.out.println("Default data initialized successfully.");
        } else {
            System.out.println("Database already contains data. Skipping initialization.");
        }
    }
}