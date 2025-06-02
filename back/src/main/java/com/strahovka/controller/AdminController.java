package com.strahovka.controller;

import com.strahovka.delivery.Role;
import com.strahovka.delivery.User;
import com.strahovka.delivery.UserLevel;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/moderators")
    public ResponseEntity<List<User>> getAllModerators() {
        return ResponseEntity.ok(userRepository.findByRole(Role.MODERATOR));
    }

    @PostMapping("/moderators")
    @Transactional
    public ResponseEntity<?> createModerator(@RequestBody User user) {
        try {
            // Validate required fields
            if (user.getEmail() == null || user.getPassword() == null || 
                user.getFirstName() == null || user.getLastName() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Required fields are missing"));
            }

            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already registered"));
            }

            // Create a new user instance to avoid any potential ID or other field injection
            User newUser = new User();
            newUser.setEmail(user.getEmail());
            newUser.setPassword(passwordEncoder.encode(user.getPassword()));
            newUser.setFirstName(user.getFirstName());
            newUser.setLastName(user.getLastName());
            newUser.setMiddleName(user.getMiddleName());
            newUser.setPhone(user.getPhone());
            newUser.setRole(Role.MODERATOR);
            newUser.setLevel(UserLevel.WOODEN);
            newUser.setPolicyCount(0);

            User savedUser = userRepository.save(newUser);
            
            // Remove sensitive data before returning
            savedUser.setPassword(null);
            savedUser.setAccessToken(null);
            savedUser.setRefreshToken(null);
            
            return ResponseEntity.ok(savedUser);
            
        } catch (Exception e) {
            e.printStackTrace(); // Add this for debugging
            return ResponseEntity.badRequest()
                    .body(Map.of(
                        "message", "Error creating moderator",
                        "error", e.getMessage()
                    ));
        }
    }

    @DeleteMapping("/moderators/{id}")
    public ResponseEntity<?> deleteModerator(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.MODERATOR) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User is not a moderator"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok()
                .body(Map.of("message", "Moderator deleted successfully"));
    }

    @PostMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User is already an admin"));
        }

        user.setRole(Role.ADMIN);
        userRepository.save(user);

        return ResponseEntity.ok()
                .body(Map.of("message", "User promoted to admin successfully"));
    }

    @PostMapping("/users/{id}/demote")
    public ResponseEntity<?> demoteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.USER) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "User is already a regular user"));
        }

        user.setRole(Role.USER);
        userRepository.save(user);

        return ResponseEntity.ok()
                .body(Map.of("message", "User demoted to regular user successfully"));
    }
} 