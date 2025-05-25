package com.strahovka.controller;

import com.strahovka.delivery.*;
import com.strahovka.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.strahovka.repository.UserRepository;
import com.strahovka.repository.InsuranceClaimRepository;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    private final UserRepository userRepository;
    private final InsuranceClaimRepository claimRepository;

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
            @RequestParam String description,
            @RequestParam(required = false) List<MultipartFile> documents) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Creating claim - User: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        
        InsuranceClaim claim = insuranceService.createClaim(policyId, description);
        
        // Handle document uploads if provided
        if (documents != null && !documents.isEmpty()) {
            for (MultipartFile document : documents) {
                try {
                    ClaimAttachment attachment = new ClaimAttachment();
                    attachment.setClaim(claim);
                    attachment.setFileName(document.getOriginalFilename());
                    attachment.setFileType(document.getContentType());
                    attachment.setFileSize(document.getSize());
                    attachment.setFileData(document.getBytes());
                    claim.getAttachments().add(attachment);
                } catch (IOException e) {
                    throw new RuntimeException("Failed to process document: " + document.getOriginalFilename(), e);
                }
            }
            claim = claimRepository.save(claim);
        }
        
        return ResponseEntity.ok(claim);
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
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<InsuranceClaim> processClaim(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        String response = request.get("response");
        BigDecimal amount = request.get("amount") != null ? new BigDecimal(request.get("amount")) : null;
        
        InsuranceClaim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Claim not found"));
            
        claim.setStatus(ClaimStatus.valueOf(status));
        claim.setResponse(response);
        claim.setProcessedAt(LocalDateTime.now());
        claim.setProcessedBy(SecurityContextHolder.getContext().getAuthentication().getName());
        claim.setResponseDate(LocalDate.now());
        
        if (amount != null) {
            claim.setCalculatedAmount(amount);
        }
        
        return ResponseEntity.ok(claimRepository.save(claim));
    }

    @GetMapping("/claims/pending")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<InsuranceClaim>> getPendingClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Getting pending claims - Admin: " + auth.getName() + ", Authorities: " + auth.getAuthorities());
        return ResponseEntity.ok(insuranceService.getPendingClaims());
    }

    @GetMapping("/claims/all")
    @PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
    public ResponseEntity<Page<InsuranceClaim>> getAllClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<InsuranceClaim> claims;
        
        if (status != null && !status.equals("ALL")) {
            claims = claimRepository.findByStatus(ClaimStatus.valueOf(status), pageRequest);
        } else {
            claims = claimRepository.findAll(pageRequest);
        }
        
        return ResponseEntity.ok(claims);
    }
} 