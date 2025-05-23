package com.strahovka.controller;

import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.repository.InsurancePolicyRepository;
import com.strahovka.repository.UserRepository;
import com.strahovka.repository.InsuranceClaimRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
public class InsurancePolicyController {

    @Autowired
    private InsurancePolicyRepository policyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @GetMapping("/policies/user")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<InsurancePolicy>> getUserPolicies() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(policyRepository.findByUserOrderByStartDateDesc(user));
    }

    @GetMapping("/claims/user")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<InsuranceClaim>> getUserClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(claimRepository.findByPolicy_User(user));
    }

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