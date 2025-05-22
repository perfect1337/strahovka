package com.strahovka.controller;

import com.strahovka.delivery.InsurancePackage;
import com.strahovka.repository.InsurancePackageRepository;
import com.strahovka.repository.InsuranceCategoryRepository;
import com.strahovka.delivery.InsuranceCategory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/insurance/packages")
public class InsurancePackageController {

    @Autowired
    private InsurancePackageRepository packageRepository;

    @Autowired
    private InsuranceCategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<List<InsurancePackage>> getAllPackages() {
        return ResponseEntity.ok(packageRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsurancePackage> getPackageById(@PathVariable Long id) {
        return packageRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePackage> createPackage(@Valid @RequestBody InsurancePackage insurancePackage) {
        return ResponseEntity.ok(packageRepository.save(insurancePackage));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePackage> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody InsurancePackage insurancePackage) {
        if (!packageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        insurancePackage.setId(id);
        return ResponseEntity.ok(packageRepository.save(insurancePackage));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        if (!packageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        packageRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 