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
import java.util.UUID;
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
        user.setRefreshToken(generateRefreshToken());
        
        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return ResponseEntity.ok(new LoginResponse(
            token,
            user.getRefreshToken(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRole().name()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("\n=== Login Attempt ===");
        System.out.println("Email: " + request.getEmail());
        
        try {
            // Check if user exists first to give a better error message
            if (!userRepository.existsByEmail(request.getEmail())) {
                System.out.println("User not found with email: " + request.getEmail());
                return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid email or password", 
                    "detail", "User not found"
                ));
            }
            
            // Get user from database
            User user = userRepository.findByEmail(request.getEmail()).get();
            
            System.out.println("User found in database");
            System.out.println("Stored password hash: " + user.getPassword());
            
            // Manually check password instead of using authenticationManager
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                System.out.println("Password does not match");
                return ResponseEntity.status(401).body(Map.of(
                    "message", "Invalid email or password", 
                    "detail", "Password does not match"
                ));
            }
            
            System.out.println("Password matches");
            System.out.println("User role from database: " + user.getRole());
            System.out.println("User authorities from getAuthorities(): " + user.getAuthorities());

            // Generate a new refresh token on login
            String refreshToken = generateRefreshToken();
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            // Generate an access token
            String token = jwtService.generateToken(user);
            System.out.println("Token generated for user: " + user.getUsername());

            // Create response with user info and token
            LoginResponse response = new LoginResponse(
                token,
                refreshToken,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
            );
            
            System.out.println("Login response prepared");
            System.out.println("Role in response: " + response.getUser().getRole());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "message", "Login failed: " + e.getMessage(),
                "stackTrace", Arrays.stream(e.getStackTrace())
                    .limit(10)
                    .map(StackTraceElement::toString)
                    .collect(Collectors.toList())
            ));
        }
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
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            System.out.println("Error: Refresh token is required");
            return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                put("message", "Refresh token is required");
            }});
        }
        
        System.out.println("Refresh token received: " + refreshToken.substring(0, Math.min(refreshToken.length(), 10)) + "...");
        System.out.println("Refresh token length: " + refreshToken.length());
        
        try {
            User user = userRepository.findByRefreshToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
            
            System.out.println("User found by refresh token");
            System.out.println("User email: " + user.getEmail());
            System.out.println("User role from database: " + user.getRole());
            
            // Generate new tokens
            String newRefreshToken = generateRefreshToken();
            user.setRefreshToken(newRefreshToken);
            userRepository.save(user);
            
            String accessToken = jwtService.generateToken(user);
            System.out.println("New tokens generated successfully:");
            System.out.println("Access token length: " + accessToken.length());
            System.out.println("Refresh token length: " + newRefreshToken.length());
            
            // Create response with the same structure as login
            LoginResponse response = new LoginResponse(
                accessToken,
                newRefreshToken,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
            );
            
            System.out.println("Token refresh response prepared");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error refreshing token: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401)
                .body(new HashMap<String, String>() {{
                    put("message", "Error refreshing token: " + e.getMessage());
                    put("error", e.getClass().getSimpleName());
                }});
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken() {
        System.out.println("\n=== Token Validation Request ===");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Email from SecurityContext: " + email);
        
        try {
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            System.out.println("User found during token validation: " + user.getEmail());
            System.out.println("User role: " + user.getRole());
            
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "user", Map.of(
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "role", user.getRole().name()
                )
            ));
        } catch (Exception e) {
            System.out.println("Token validation error: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of(
                "valid", false,
                "message", "Token validation failed: " + e.getMessage()
            ));
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
    
    private String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    // Add a test endpoint for creating a test user with known credentials
    @PostMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        try {
            if (userRepository.existsByEmail("test@example.com")) {
                // Update existing test user
                User user = userRepository.findByEmail("test@example.com").get();
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(Role.ROLE_USER);
                user.setRefreshToken(generateRefreshToken());
                userRepository.save(user);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Test user updated with password: password123",
                    "email", "test@example.com",
                    "id", user.getId()
                ));
            } else {
                // Create new test user
                User user = new User();
                user.setFirstName("Test");
                user.setLastName("User");
                user.setEmail("test@example.com");
                user.setPassword(passwordEncoder.encode("password123"));
                user.setRole(Role.ROLE_USER);
                user.setRefreshToken(generateRefreshToken());
                
                userRepository.save(user);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Test user created with password: password123",
                    "email", "test@example.com",
                    "id", user.getId()
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Create test user error",
                "message", e.getMessage(),
                "stackTrace", Arrays.stream(e.getStackTrace())
                    .limit(10)
                    .map(StackTraceElement::toString)
                    .collect(Collectors.toList())
            ));
        }
    }
    
    // Add a debug endpoint for login issues
    @PostMapping("/debug-login")
    public ResponseEntity<?> debugLogin(@RequestBody LoginRequest request) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("email", request.getEmail());
            
            // System info
            response.put("serverInfo", Map.of(
                "timestamp", new java.util.Date().toString(),
                "jwtServiceAvailable", jwtService != null,
                "passwordEncoderType", passwordEncoder.getClass().getSimpleName()
            ));
            
            // Check if user exists
            boolean userExists = userRepository.existsByEmail(request.getEmail());
            response.put("userExists", userExists);
            
            if (userExists) {
                User user = userRepository.findByEmail(request.getEmail()).get();
                response.put("foundUser", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName(),
                    "role", user.getRole().name(),
                    "passwordHash", user.getPassword().substring(0, 10) + "..."
                ));
                
                // Check password
                boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());
                response.put("passwordMatches", passwordMatches);
                
                // Check user details implementation
                response.put("userAuthorities", user.getAuthorities().stream()
                    .map(auth -> Map.of(
                        "authority", auth.getAuthority(),
                        "class", auth.getClass().getSimpleName()
                    ))
                    .collect(Collectors.toList()));
                    
                // Try to generate a token to verify token generation works
                try {
                    String testToken = jwtService.generateToken(user);
                    response.put("tokenGenerationSuccess", true);
                    response.put("tokenPreview", testToken.substring(0, Math.min(50, testToken.length())) + "...");
                } catch (Exception e) {
                    response.put("tokenGenerationSuccess", false);
                    response.put("tokenGenerationError", e.getMessage());
                }
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Debug login error",
                "message", e.getMessage(),
                "stackTrace", Arrays.stream(e.getStackTrace())
                    .limit(10)
                    .map(StackTraceElement::toString)
                    .collect(Collectors.toList())
            ));
        }
    }

    // Add a simple test endpoint to check if auth endpoints are accessible
    @GetMapping("/test")
    public ResponseEntity<?> testAuthEndpoint() {
        return ResponseEntity.ok(Map.of(
            "message", "Auth endpoint is accessible",
            "timestamp", new java.util.Date().toString()
        ));
    }
} 