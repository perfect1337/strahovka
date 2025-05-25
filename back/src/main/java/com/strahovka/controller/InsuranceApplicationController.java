package com.strahovka.controller;

import com.strahovka.delivery.*;
import com.strahovka.service.InsuranceApplicationService;
import com.strahovka.repository.UserRepository;
import com.strahovka.dto.KaskoApplicationRequest;
import com.strahovka.service.KaskoApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/insurance/applications")
@RequiredArgsConstructor
public class InsuranceApplicationController {
    private final InsuranceApplicationService applicationService;
    private final UserRepository userRepository;
    private final KaskoApplicationService kaskoApplicationService;

    @PostMapping("/kasko")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> createKaskoApplication(
            @Valid @RequestBody KaskoApplicationRequest request,
            BindingResult bindingResult,
            Authentication authentication) {
        
        if (bindingResult.hasErrors()) {
            List<String> errors = bindingResult.getAllErrors()
                    .stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errors);
        }

        KaskoApplication application = kaskoApplicationService.createApplication(
                request, authentication.getName());
        return ResponseEntity.ok(application);
    }

    @PostMapping("/osago")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<OsagoApplication> createOsagoApplication(
            @RequestBody OsagoApplication application,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        application.setUser(user);
        return ResponseEntity.ok(applicationService.createOsagoApplication(application));
    }

    @PostMapping("/travel")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<TravelApplication> createTravelApplication(
            @RequestBody TravelApplication application,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        application.setUser(user);
        return ResponseEntity.ok(applicationService.createTravelApplication(application));
    }

    @PostMapping("/health")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<HealthApplication> createHealthApplication(
            @RequestBody HealthApplication application,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        application.setUser(user);
        return ResponseEntity.ok(applicationService.createHealthApplication(application));
    }

    @PostMapping("/property")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<PropertyApplication> createPropertyApplication(
            @RequestBody PropertyApplication application,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        application.setUser(user);
        return ResponseEntity.ok(applicationService.createPropertyApplication(application));
    }

    @PostMapping("/kasko/{id}/pay")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> processKaskoPayment(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            KaskoApplication application = kaskoApplicationService.processPayment(id, authentication.getName());
            return ResponseEntity.ok(application);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/kasko")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<KaskoApplication>> getUserKaskoApplications(Authentication authentication) {
        List<KaskoApplication> applications = kaskoApplicationService.getUserApplications(authentication.getName());
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/user/kasko/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<?> getUserKaskoApplication(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(applicationService.getKaskoApplication(id, authentication));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/osago")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<OsagoApplication>> getUserOsagoApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getUserOsagoApplications(user));
    }

    @GetMapping("/user/travel")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<TravelApplication>> getUserTravelApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getUserTravelApplications(user));
    }

    @GetMapping("/user/health")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<HealthApplication>> getUserHealthApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getUserHealthApplications(user));
    }

    @GetMapping("/user/property")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<PropertyApplication>> getUserPropertyApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getUserPropertyApplications(user));
    }

    @GetMapping("/user/all")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<BaseApplication>> getAllUserApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getAllUserApplications(user));
    }
} 