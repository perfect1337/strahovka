package com.strahovka.controller;

import com.strahovka.delivery.InsuranceGuide;
import com.strahovka.service.InsuranceGuideService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance/guides")
public class InsuranceGuideController {

    @Autowired
    private InsuranceGuideService guideService;

    @GetMapping
    public ResponseEntity<List<InsuranceGuide>> getAllGuides() {
        return ResponseEntity.ok(guideService.getAllGuides());
    }

    @GetMapping("/active")
    public ResponseEntity<List<InsuranceGuide>> getActiveGuides() {
        return ResponseEntity.ok(guideService.getActiveGuides());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceGuide> getGuideById(@PathVariable Long id) {
        return guideService.getGuideById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{insuranceType}")
    public ResponseEntity<InsuranceGuide> getGuideByType(@PathVariable String insuranceType) {
        return guideService.getGuideByInsuranceType(insuranceType)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InsuranceGuide> createGuide(@Valid @RequestBody InsuranceGuide guide) {
        return ResponseEntity.ok(guideService.createGuide(guide));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InsuranceGuide> updateGuide(
            @PathVariable Long id,
            @Valid @RequestBody InsuranceGuide guideDetails) {
        return guideService.updateGuide(id, guideDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id) {
        guideService.deleteGuide(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<InsuranceGuide> toggleGuideStatus(@PathVariable Long id) {
        return guideService.toggleGuideStatus(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
} 