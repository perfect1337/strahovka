package com.strahovka.controller;

import com.strahovka.delivery.PolicyApplication;
import com.strahovka.entity.ApplicationStatus;
import com.strahovka.delivery.User;
import com.strahovka.delivery.InsurancePackage;
import com.strahovka.service.PolicyApplicationService;
import com.strahovka.repository.PolicyApplicationRepository;
import com.strahovka.repository.UserRepository;
import com.strahovka.repository.InsurancePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance/applications")
@RequiredArgsConstructor
public class PolicyApplicationController {
    private final PolicyApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final InsurancePackageRepository packageRepository;
    private final PolicyApplicationService applicationService;

    @PostMapping("/create")
    public ResponseEntity<PolicyApplication> createApplication(
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        InsurancePackage insurancePackage = packageRepository.findById(request.get("packageId"))
            .orElseThrow(() -> new RuntimeException("Insurance package not found"));

        PolicyApplication application = applicationService.createApplication(user, insurancePackage);
        return ResponseEntity.ok(application);
    }

    @GetMapping("/user")
    public ResponseEntity<List<PolicyApplication>> getUserApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(applicationService.getUserApplications(user));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_MODERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<Page<PolicyApplication>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) ApplicationStatus status) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<PolicyApplication> applications = status != null 
            ? applicationRepository.findByStatus(status, pageRequest)
            : applicationRepository.findAll(pageRequest);
            
        return ResponseEntity.ok(applications);
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasAnyAuthority('ROLE_MODERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<PolicyApplication> processApplication(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        
        PolicyApplication application = applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        String status = (String) request.get("status");
        String notes = (String) request.get("notes");
        BigDecimal amount = request.get("calculatedAmount") != null 
            ? new BigDecimal(request.get("calculatedAmount").toString()) 
            : null;

        application.setStatus(ApplicationStatus.valueOf(status));
        application.setNotes(notes);
        application.setCalculatedAmount(amount);
        application.setProcessedAt(LocalDateTime.now());
        application.setProcessedBy(authentication.getName());

        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_MODERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<PolicyApplication> getApplication(@PathVariable Long id) {
        return applicationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
} 