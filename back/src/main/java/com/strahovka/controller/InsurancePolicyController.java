package com.strahovka.controller;

import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.repository.InsurancePolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
public class InsurancePolicyController {

    @Autowired
    private InsurancePolicyRepository policyRepository;

    @GetMapping("/available-policies")
    public ResponseEntity<List<InsurancePolicy>> getAvailablePolicies() {
        return ResponseEntity.ok(policyRepository.findByActiveTrue());
    }

    @GetMapping("/policies/{id}")
    public ResponseEntity<InsurancePolicy> getPolicyById(@PathVariable Long id) {
        return policyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/admin-policies")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePolicy> createPolicy(@Valid @RequestBody InsurancePolicy policy) {
        return ResponseEntity.ok(policyRepository.save(policy));
    }

    @PutMapping("/policies/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<InsurancePolicy> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody InsurancePolicy policy) {
        if (!policyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        policy.setId(id);
        return ResponseEntity.ok(policyRepository.save(policy));
    }

    @DeleteMapping("/policies/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        if (!policyRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        policyRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
} 