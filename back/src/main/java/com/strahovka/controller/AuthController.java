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
        
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        System.out.println("Authentication successful");
        System.out.println("Authorities after authentication: " + authentication.getAuthorities());

        // Get user details from database
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            
        System.out.println("User found in database");
        System.out.println("User role from database: " + user.getRole());
        System.out.println("User authorities from getAuthorities(): " + user.getAuthorities());

        // Generate a single token
        String token = jwtService.generateToken(user);
        System.out.println("Token generated for user: " + user.getUsername());

        // Create response with user info and token
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
        System.out.println("\n=== Token Refresh Request ===");
        String email = request.get("email");
        
        if (email == null || email.trim().isEmpty()) {
            System.out.println("Error: Email is required");
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("message", "Email is required");
            }});
        }
        
        System.out.println("Refresh token request for email: " + email);
        
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
            
            System.out.println("User found in database");
            System.out.println("User role from database: " + user.getRole());
            System.out.println("User authorities from getAuthorities(): " + user.getAuthorities());
            
            // Generate a new token
            String token = jwtService.generateToken(user);
            System.out.println("New token generated successfully");
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("role", user.getRole().name());
            response.put("tokenInfo", extractTokenInfo(token));
            
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
        try {
            Map<String, Object> tokenInfo = new HashMap<>();
            tokenInfo.put("username", jwtService.extractUsername(token));
            tokenInfo.put("roles", jwtService.extractRoles(token));
            tokenInfo.put("expiration", jwtService.extractClaim(token, claims -> claims.getExpiration()));
            tokenInfo.put("issuedAt", jwtService.extractClaim(token, claims -> claims.getIssuedAt()));
            return tokenInfo;
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }
} 