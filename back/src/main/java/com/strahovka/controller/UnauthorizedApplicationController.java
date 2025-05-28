package com.strahovka.controller;

import com.strahovka.delivery.*;
import com.strahovka.service.UserService;
import com.strahovka.service.InsurancePackageService;
import com.strahovka.repository.InsuranceApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance/unauthorized")
@RequiredArgsConstructor
public class UnauthorizedApplicationController {
    private final UserService userService;
    private final InsurancePackageService packageService;
    private final InsuranceApplicationRepository applicationRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/apply")
    public ResponseEntity<?> createApplicationWithRegistration(@RequestBody Map<String, Object> request) {
        try {
            // Create or get user
            User user = userService.findByEmail(request.get("email").toString())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.get("email").toString());
                    newUser.setPassword(passwordEncoder.encode(request.get("password").toString()));
                    newUser.setFirstName(request.get("firstName").toString());
                    newUser.setLastName(request.get("lastName").toString());
                    newUser.setMiddleName(request.get("middleName").toString());
                    newUser.setPhone(request.get("phone").toString());
                    newUser.setRole(Role.ROLE_USER);
                    return userService.save(newUser);
                });

            // Get insurance package
            InsurancePackage insurancePackage = packageService.getPackageById(Long.parseLong(request.get("packageId").toString()));

            // Create insurance application
            InsuranceApplication application = new InsuranceApplication();
            application.setUser(user);
            application.setInsurancePackage(insurancePackage);
            application.setType(request.get("type").toString());
            application.setStatus("PENDING");
            application.setCreatedAt(LocalDateTime.now());
            application.setPassportNumber(request.get("passportNumber").toString());
            application.setPassportIssuedBy(request.get("passportIssuedBy").toString());
            application.setPassportIssuedDate(java.time.LocalDate.parse(request.get("passportIssuedDate").toString()));
            application.setBirthDate(java.time.LocalDate.parse(request.get("birthDate").toString()));
            application.setAddress(request.get("address").toString());
            if (request.containsKey("additionalInfo")) {
                application.setAdditionalInfo(request.get("additionalInfo").toString());
            }

            application = applicationRepository.save(application);

            // Generate tokens
            String accessToken = userService.generateAccessToken(user);
            String refreshToken = userService.generateRefreshToken(user);

            // Update user with tokens
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userService.save(user);

            return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", user,
                "application", application
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Ошибка при создании заявки: " + e.getMessage()));
        }
    }
} 