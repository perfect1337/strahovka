package com.strahovka.controller;

import com.strahovka.dto.LoginRequest;
import com.strahovka.dto.LoginResponse;
import com.strahovka.dto.RegisterRequest;
import com.strahovka.delivery.Role;
import com.strahovka.delivery.User;
import com.strahovka.repository.UserRepository;
import com.strahovka.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Пользователь с таким email уже существует");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(new LoginResponse(
            token,
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("\n=== Login Attempt ===");
        System.out.println("Email: " + request.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        System.out.println("Authentication successful");
        System.out.println("Authorities after authentication: " + authentication.getAuthorities());

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            
        System.out.println("User found in database");
        System.out.println("User role from database: " + user.getRole());
        System.out.println("User authorities from getAuthorities(): " + user.getAuthorities());

        // Add role to token claims
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("roles", user.getRole().name());
        String token = jwtService.generateToken(extraClaims, user);
        
        System.out.println("Token generated with roles: " + extraClaims);

        LoginResponse response = new LoginResponse(
            token,
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name()
        );
        
        System.out.println("Login response prepared");
        System.out.println("Role in response: " + response.getRole());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("\n=== Getting Current User ===");
        System.out.println("Email from SecurityContext: " + email);
        System.out.println("Authorities from SecurityContext: " + 
            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        System.out.println("User found in database");
        System.out.println("User role from database: " + user.getRole());
        System.out.println("User authorities from getAuthorities(): " + user.getAuthorities());
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        
        System.out.println("Response prepared");
        System.out.println("Role in response: " + response.get("role"));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("message", "Email is required");
            }});
        }
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        System.out.println("Refreshing token for user: " + email);
        String token = jwtService.generateToken(user);
        
        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("token", token);
            put("email", user.getEmail());
            put("firstName", user.getFirstName());
            put("lastName", user.getLastName());
            put("role", user.getRole().name());
        }});
    }
} 