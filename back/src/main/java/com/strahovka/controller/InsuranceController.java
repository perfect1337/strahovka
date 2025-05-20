package com.strahovka.controller;

import com.strahovka.delivery.*;
import com.strahovka.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import com.strahovka.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    private final UserRepository userRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<InsuranceCategory>> getAllCategories() {
        return ResponseEntity.ok(insuranceService.getAllCategories());
    }

    @GetMapping("/packages")
    public ResponseEntity<List<InsurancePackage>> getAllPackages() {
        return ResponseEntity.ok(insuranceService.getAllPackages());
    }

    @PostMapping("/policies")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InsurancePolicy> createPolicy(
            @RequestParam Long categoryId,
            @RequestParam LocalDate endDate,
            @RequestParam String details) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.createPolicy(userId, categoryId, endDate, details));
    }

    @PostMapping("/packages/{packageId}/policies")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<InsurancePolicy>> createPackagePolicies(
            @PathVariable Long packageId,
            @RequestParam LocalDate endDate,
            @RequestParam String details) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.createPackagePolicies(userId, packageId, endDate, details));
    }

    @GetMapping("/policies")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<InsurancePolicy>> getUserPolicies() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.getUserPolicies(userId));
    }

    @PostMapping("/policies/{policyId}/suspend")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InsurancePolicy> suspendPolicy(@PathVariable Long policyId) {
        return ResponseEntity.ok(insuranceService.suspendPolicy(policyId));
    }

    @PostMapping("/claims")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<InsuranceClaim> createClaim(
            @RequestParam Long policyId,
            @RequestParam String description) {
        return ResponseEntity.ok(insuranceService.createClaim(policyId, description));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<InsuranceClaim>> getUserClaims() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.getUserClaims(userId));
    }

    @PostMapping("/claims/{claimId}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InsuranceClaim> processClaim(
            @PathVariable Long claimId,
            @RequestParam String response,
            @RequestParam ClaimStatus status) {
        return ResponseEntity.ok(insuranceService.processClaim(claimId, response, status));
    }

    @GetMapping("/claims/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InsuranceClaim>> getPendingClaims() {
        return ResponseEntity.ok(insuranceService.getPendingClaims());
    }
} 