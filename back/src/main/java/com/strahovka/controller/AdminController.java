package com.strahovka.controller;

import com.strahovka.delivery.Role;
import com.strahovka.delivery.User;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
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