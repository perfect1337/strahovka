package com.strahovka.controller;

import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.Claims.InsuranceClaim;
import com.strahovka.delivery.Claims.ClaimStatus;
import com.strahovka.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;


    @PostMapping
    public ResponseEntity<InsuranceGuide> createGuide(@RequestBody InsuranceGuide guide) {
        return ResponseEntity.ok(insuranceService.createGuide(guide));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceGuide> updateGuide(@PathVariable Long id, @RequestBody InsuranceGuide guide) {
        return ResponseEntity.ok(insuranceService.updateGuide(id, guide));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id) {
        insuranceService.deleteGuide(id);
        return ResponseEntity.ok().build();
    }
    // Guide endpoints
    @GetMapping("/guides")
    public ResponseEntity<List<InsuranceGuide>> getAllGuides() {
        return ResponseEntity.ok(insuranceService.getAllGuides());
    }

    @GetMapping("/guides/{id}")
    public ResponseEntity<InsuranceGuide> getGuideById(@PathVariable Long id) {
        return ResponseEntity.ok(insuranceService.getGuideById(id));
    }

    // Policy endpoints
    @GetMapping("/policies")
    public ResponseEntity<List<InsurancePolicy>> getUserPolicies(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("getUserPolicies called. UserDetails: {}", userDetails);
        if (userDetails == null) {
            log.error("UserDetails is NULL in getUserPolicies");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserPolicies(userDetails.getUsername()));
    }

    @PostMapping("/policies")
    public ResponseEntity<InsurancePolicy> createPolicy(
            @RequestBody InsurancePolicy policy,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(insuranceService.createPolicy(policy, userDetails.getUsername()));
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<InsurancePolicy> updatePolicy(
            @PathVariable Long id,
            @RequestBody InsurancePolicy policy) {
        return ResponseEntity.ok(insuranceService.updatePolicy(id, policy));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        insuranceService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }

    // Package endpoints
    @GetMapping("/packages")
    public ResponseEntity<List<InsurancePackage>> getUserPackages(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(insuranceService.getUserPackages(userDetails.getUsername()));
    }

    @PostMapping("/packages")
    public ResponseEntity<InsurancePackage> createPackage(
            @RequestBody InsurancePackage insurancePackage,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(insuranceService.createPackage(insurancePackage, userDetails.getUsername()));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<InsurancePackage> updatePackage(
            @PathVariable Long id,
            @RequestBody InsurancePackage insurancePackage) {
        return ResponseEntity.ok(insuranceService.updatePackage(id, insurancePackage));
    }

    @DeleteMapping("/packages/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        insuranceService.deletePackage(id);
        return ResponseEntity.ok().build();
    }

    // Application endpoints
    @PostMapping("/applications/kasko")
    public ResponseEntity<KaskoApplication> createKaskoApplication(
            @RequestBody KaskoApplication kaskoApplication,
            Authentication authentication) {
        log.info("createKaskoApplication called. Authentication: {}, Payload: {}", authentication, kaskoApplication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in createKaskoApplication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        KaskoApplication createdApplication = insuranceService.createKaskoApplication(kaskoApplication, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    @GetMapping("/applications/kasko")
    public ResponseEntity<List<KaskoApplication>> getUserKaskoApplications(Authentication auth) {
        log.info("getUserKaskoApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserKaskoApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserKaskoApplications(auth.getName()));
    }

    @GetMapping("/applications/osago")
    public ResponseEntity<List<OsagoApplication>> getUserOsagoApplications(Authentication auth) {
        log.info("getUserOsagoApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserOsagoApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserOsagoApplications(auth.getName()));
    }

    @GetMapping("/applications/property")
    public ResponseEntity<List<PropertyApplication>> getUserPropertyApplications(Authentication auth) {
        log.info("getUserPropertyApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserPropertyApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserPropertyApplications(auth.getName()));
    }

    @GetMapping("/applications/health")
    public ResponseEntity<List<HealthApplication>> getUserHealthApplications(Authentication auth) {
        log.info("getUserHealthApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserHealthApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserHealthApplications(auth.getName()));
    }

    @GetMapping("/applications/travel")
    public ResponseEntity<List<TravelApplication>> getUserTravelApplications(Authentication auth) {
        log.info("getUserTravelApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserTravelApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserTravelApplications(auth.getName()));
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        insuranceService.deleteApplication(id);
        return ResponseEntity.ok().build();
    }

    // Category endpoints
    @GetMapping("/categories")
    public ResponseEntity<List<InsuranceCategory>> getAllCategories() {
        return ResponseEntity.ok(insuranceService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<InsuranceCategory> createCategory(@RequestBody InsuranceCategory category) {
        return ResponseEntity.ok(insuranceService.createCategory(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<InsuranceCategory> updateCategory(
            @PathVariable Long id,
            @RequestBody InsuranceCategory category) {
        return ResponseEntity.ok(insuranceService.updateCategory(id, category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        insuranceService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // Public endpoints
    @GetMapping("/packages/public")
    public ResponseEntity<List<InsurancePackage>> getPublicPackages() {
        return ResponseEntity.ok(insuranceService.getPublicPackages());
    }

    // Claims endpoints
    @GetMapping("/claims/user")
    public ResponseEntity<List<InsuranceClaim>> getUserClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        log.info("getUserClaims called. Authentication: {}, Page: {}, Size: {}", auth, page, size);
        if (auth == null) {
            log.error("Authentication is NULL in getUserClaims");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserClaims(auth.getName(), page, size));
    }

    @PostMapping("/claims")
    public ResponseEntity<InsuranceClaim> createClaim(@RequestBody InsuranceClaim claim, Authentication auth) {
        log.info("createClaim called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in createClaim");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.createClaim(claim, auth.getName()));
    }
} 