package com.strahovka.controller;

import com.strahovka.delivery.InsurancePackage;
import com.strahovka.repository.InsurancePackageRepository;
import com.strahovka.repository.InsuranceCategoryRepository;
import com.strahovka.delivery.InsuranceCategory;
import com.strahovka.service.InsurancePackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsurancePackageController {
    private final InsurancePackageService insurancePackageService;

    @GetMapping("/packages")
    public ResponseEntity<List<InsurancePackage>> getAllPackages() {
        return ResponseEntity.ok(insurancePackageService.getAllActivePackages());
    }

    @GetMapping("/packages/public")
    public ResponseEntity<List<InsurancePackage>> getPublicPackages() {
        return ResponseEntity.ok(insurancePackageService.getAllActivePackages());
    }

    @GetMapping("/packages/{id}")
    public ResponseEntity<InsurancePackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(insurancePackageService.getPackageById(id));
    }

    @PostMapping("/packages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InsurancePackage> createPackage(@Valid @RequestBody InsurancePackage insurancePackage) {
        return ResponseEntity.ok(insurancePackageService.createPackage(insurancePackage));
    }

    @PutMapping("/packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InsurancePackage> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody InsurancePackage insurancePackage) {
        return ResponseEntity.ok(insurancePackageService.updatePackage(id, insurancePackage));
    }

    @DeleteMapping("/packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        insurancePackageService.deletePackage(id);
        return ResponseEntity.ok().build();
    }
} 