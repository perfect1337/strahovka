package com.strahovka.controller;

import com.strahovka.dto.LoginRequest;
import com.strahovka.dto.LoginResponse;
import com.strahovka.dto.RegisterRequest;
import com.strahovka.delivery.Role;
import com.strahovka.delivery.User;
import com.strahovka.repository.UserRepository;
import com.strahovka.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Invalid authorization header");
        }

        String token = authHeader.substring(7);
        try {
            String userEmail = jwtService.extractUsername(token);
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!jwtService.isTokenValid(token, userEmail)) {
                return ResponseEntity.status(401).body("Token is invalid or expired");
            }

            return ResponseEntity.ok(LoginResponse.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .middleName(user.getMiddleName())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .level(user.getLevel())
                    .policyCount(user.getPolicyCount())
                    .build());
        } catch (Exception e) {
            log.error("Token validation error", e);
            return ResponseEntity.status(401).body("Token validation failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtService.generateToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setAccessToken(token);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(token)
                .refreshToken(refreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .middleName(user.getMiddleName())
                .phone(user.getPhone())
                .role(user.getRole())
                .level(user.getLevel())
                .policyCount(user.getPolicyCount())
                .build());
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Starting registration process for email: {}", request.getEmail());
        
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email already registered: {}", request.getEmail());
            throw new RuntimeException("Email already registered");
        }

        try {
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .role(Role.USER)
                    .build();

            log.info("Saving user to database...");
            user = userRepository.save(user);
            log.info("User saved successfully with ID: {}", user.getId());

            String token = jwtService.generateToken(user.getEmail());
            String refreshToken = jwtService.generateRefreshToken(user.getEmail());

            user.setAccessToken(token);
            user.setRefreshToken(refreshToken);
            
            log.info("Updating user with tokens...");
            user = userRepository.save(user);
            log.info("User updated with tokens successfully");

            return ResponseEntity.ok(LoginResponse.builder()
                    .accessToken(token)
                    .refreshToken(refreshToken)
                    .id(user.getId())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .middleName(user.getMiddleName())
                    .phone(user.getPhone())
                    .role(user.getRole())
                    .level(user.getLevel())
                    .policyCount(user.getPolicyCount())
                    .build());
        } catch (Exception e) {
            log.error("Error during registration", e);
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken == null || !refreshToken.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid refresh token");
        }

        String token = refreshToken.substring(7);
        String userEmail = jwtService.extractUsername(token);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!token.equals(user.getRefreshToken())) {
            throw new RuntimeException("Invalid refresh token");
        }

        String newToken = jwtService.generateToken(userEmail);
        String newRefreshToken = jwtService.generateRefreshToken(userEmail);

        user.setAccessToken(newToken);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(newToken)
                .refreshToken(newRefreshToken)
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .middleName(user.getMiddleName())
                .phone(user.getPhone())
                .role(user.getRole())
                .level(user.getLevel())
                .policyCount(user.getPolicyCount())
                .build());
    }
} 