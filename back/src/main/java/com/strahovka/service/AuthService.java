package com.strahovka.service;

import com.strahovka.delivery.Role;
import com.strahovka.delivery.User;
import com.strahovka.dto.LoginRequest;
import com.strahovka.dto.LoginResponse;
import com.strahovka.dto.RegisterRequest;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public LoginResponse login(LoginRequest request) {
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

        return new LoginResponse(token, refreshToken);
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .middleName(request.getMiddleName())
                .phone(request.getPhone())
                .role(Role.USER)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setAccessToken(token);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return new LoginResponse(token, refreshToken);
    }

    @Transactional
    public LoginResponse refreshToken(String refreshToken) {
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

        return new LoginResponse(newToken, newRefreshToken);
    }
} 