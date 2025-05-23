package com.strahovka.controller;

import com.strahovka.delivery.Role;
import com.strahovka.delivery.User;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/moderators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getModerators() {
        List<User> moderators = userRepository.findByRole(Role.ROLE_MODERATOR);
        return ResponseEntity.ok(moderators);
    }

    @PostMapping("/moderators")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createModerator(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().build();
        }

        User moderator = new User();
        moderator.setEmail(email);
        moderator.setPassword(passwordEncoder.encode(password));
        moderator.setFirstName(firstName);
        moderator.setLastName(lastName);
        moderator.setRole(Role.ROLE_MODERATOR);

        return ResponseEntity.ok(userRepository.save(moderator));
    }

    @DeleteMapping("/moderators/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteModerator(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 