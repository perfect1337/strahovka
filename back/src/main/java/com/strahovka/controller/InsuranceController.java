package com.strahovka.controller;

import com.strahovka.delivery.*;
import com.strahovka.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.strahovka.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

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

    @PostMapping("/policies")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<InsurancePolicy> createPolicy(
            @RequestParam Long categoryId,
            @RequestParam LocalDate endDate,
            @RequestParam String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Creating policy - User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.createPolicy(userId, categoryId, endDate, details));
    }

    @PostMapping("/packages/{packageId}/policies")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<InsurancePolicy>> createPackagePolicies(
            @PathVariable Long packageId,
            @RequestParam LocalDate endDate,
            @RequestParam String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Creating package policies - User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.createPackagePolicies(userId, packageId, endDate, details));
    }

    @GetMapping("/policies")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<InsurancePolicy>> getUserPolicies() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Getting user policies - User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.getUserPolicies(userId));
    }

    @PostMapping("/policies/{policyId}/suspend")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<InsurancePolicy> suspendPolicy(@PathVariable Long policyId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Suspending policy - User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(insuranceService.suspendPolicy(policyId));
    }

    @PostMapping("/claims")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<InsuranceClaim> createClaim(
            @RequestParam Long policyId,
            @RequestParam String description) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Creating claim - User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(insuranceService.createClaim(policyId, description));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<InsuranceClaim>> getUserClaims() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        Long userId = user.getId();
        return ResponseEntity.ok(insuranceService.getUserClaims(userId));
    }

    @PostMapping("/claims/{claimId}/process")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InsuranceClaim> processClaim(
            @PathVariable Long claimId,
            @RequestParam String resolution,
            @RequestParam ClaimStatus status,
            @RequestParam BigDecimal amount) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Processing claim - Admin: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(insuranceService.processClaim(claimId, resolution, status, amount));
    }

    @GetMapping("/claims/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<InsuranceClaim>> getPendingClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Getting pending claims - Admin: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(insuranceService.getPendingClaims());
    }
} 