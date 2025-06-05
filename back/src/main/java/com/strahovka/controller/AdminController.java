package com.strahovka.controller;

import com.strahovka.entity.User;
import com.strahovka.enums.Role;
import com.strahovka.enums.UserLevel;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;

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
            if (user == null || user.getEmail() == null || user.getPassword() == null ||
                user.getFirstName() == null || user.getLastName() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Required fields are missing"));
            }


            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already registered"));
            }

            String encodedPassword = passwordEncoder.encode(user.getPassword());

            User newUser = User.builder()
                .email(user.getEmail())
                .password(encodedPassword)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(Role.MODERATOR)
                .level(UserLevel.WOODEN)
                .policyCount(0)
                .build();


            User savedUser = userRepository.saveAndFlush(newUser);
            User responseUser = User.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .middleName(savedUser.getMiddleName())
                .phone(savedUser.getPhone())
                .role(savedUser.getRole())
                .level(savedUser.getLevel())
                .policyCount(savedUser.getPolicyCount())
                .build();


            return ResponseEntity.ok(responseUser);
            
        } catch (Exception e) {
            String userEmailForLog = (user != null && user.getEmail() != null) ? user.getEmail() : "unknown";
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "message", "Error creating moderator: " + e.getMessage(),
                        "errorClass", e.getClass().getName()
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