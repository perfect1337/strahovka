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

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("message", "Email already exists");
            }});
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(Role.ROLE_USER);
        String token = jwtService.generateToken(user);
        String refreshToken = UUID.randomUUID().toString();
        
        // Save tokens
        user.setAccessToken(token);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("refreshToken", refreshToken);
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        response.put("level", user.getLevel().name());
        response.put("policyCount", user.getPolicyCount());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );

            User user = (User) authentication.getPrincipal();
            String token = jwtService.generateToken(user);
            String refreshToken = UUID.randomUUID().toString();
            
            // Save tokens
            user.setAccessToken(token);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("refreshToken", refreshToken);
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("role", user.getRole().name());
            response.put("level", user.getLevel().name());
            response.put("policyCount", user.getPolicyCount());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("message", "Invalid credentials");
            }});
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new HashMap<String, String>() {{
                put("message", "Not authenticated");
            }});
        }

        User user = (User) authentication.getPrincipal();
        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("role", user.getRole().name());
        response.put("level", user.getLevel().name());
        response.put("policyCount", user.getPolicyCount());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String refreshToken = request.get("refreshToken");

            System.out.println("Refreshing token for user: " + email);
            System.out.println("Refresh token: " + refreshToken);

            if (email == null || refreshToken == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("message", "Email and refresh token are required");
                }});
            }

            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify refresh token
            if (!refreshToken.equals(user.getRefreshToken())) {
                System.out.println("Refresh token mismatch");
                return ResponseEntity.status(401).body(new HashMap<String, String>() {{
                    put("message", "Invalid refresh token");
                }});
            }

            // Generate new tokens
            String newToken = jwtService.generateToken(user);
            String newRefreshToken = UUID.randomUUID().toString();
            
            // Update tokens in database
            user.setAccessToken(newToken);
            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);
            
            System.out.println("New tokens generated successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", newToken);
            response.put("refreshToken", newRefreshToken);
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("role", user.getRole().name());
            response.put("level", user.getLevel().name());
            response.put("policyCount", user.getPolicyCount());
            
            System.out.println("Token refresh response prepared");
            System.out.println("Role in response: " + response.get("role"));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error refreshing token: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(new HashMap<String, String>() {{
                    put("message", "Error refreshing token: " + e.getMessage());
                }});
        }
    }

    @GetMapping("/debug-token")
    public ResponseEntity<?> debugToken() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String token = null;
            
            // Try to extract token from request
            if (auth != null && auth.getCredentials() instanceof String) {
                token = (String) auth.getCredentials();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("isAuthenticated", auth != null && auth.isAuthenticated());
            response.put("principal", auth != null ? auth.getPrincipal() : null);
            response.put("name", auth != null ? auth.getName() : null);
            response.put("authorities", auth != null ? 
                auth.getAuthorities().stream()
                    .map(a -> Map.of(
                        "authority", a.getAuthority(),
                        "class", a.getClass().getSimpleName()
                    ))
                    .collect(Collectors.toList()) : null);
            
            // Include token info if available
            if (token != null) {
                try {
                    response.put("token", token.substring(0, Math.min(token.length(), 20)) + "...");
                    response.put("tokenLength", token.length());
                    response.put("tokenInfo", extractTokenInfo(token));
                } catch (Exception e) {
                    response.put("tokenError", e.getMessage());
                }
            } else {
                response.put("token", "Not available in authentication object");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of(
                    "error", "Error debugging token", 
                    "message", e.getMessage(),
                    "stackTrace", Arrays.toString(e.getStackTrace())
                ));
        }
    }
    
    private Map<String, Object> extractTokenInfo(String token) {
        Map<String, Object> tokenInfo = new HashMap<>();
        try {
            tokenInfo.put("claims", jwtService.extractAllClaims(token));
            tokenInfo.put("isExpired", jwtService.isTokenExpired(token));
            tokenInfo.put("subject", jwtService.extractUsername(token));
        } catch (Exception e) {
            tokenInfo.put("error", e.getMessage());
        }
        return tokenInfo;
    }
} 