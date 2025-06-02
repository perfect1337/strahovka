package com.strahovka.controller;

import com.strahovka.delivery.Claims;
import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.Claims.InsuranceClaim;
import com.strahovka.delivery.Claims.ClaimStatus;
import com.strahovka.delivery.Claims.ClaimAttachment;
import com.strahovka.service.InsuranceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;

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
        log.debug("getUserPolicies called. UserDetails: {}", userDetails);
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

    @GetMapping("/packages/admin")
    public ResponseEntity<List<InsurancePackage>> getAdminPackages() {
        return ResponseEntity.ok(insuranceService.getAllPackages());
    }

    @GetMapping("/packages/public")
    public ResponseEntity<List<InsurancePackage>> getPublicPackages() {
        return ResponseEntity.ok(insuranceService.getPublicPackages());
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

    @PostMapping("/kasko/{applicationId}/pay")
    public ResponseEntity<?> processKaskoPayment(@PathVariable Long applicationId, Authentication authentication) {
        log.info("processKaskoPayment called for application ID: {}, Authentication: {}", applicationId, authentication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in processKaskoPayment");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            InsurancePolicy policy = insuranceService.processKaskoPayment(applicationId, authentication.getName());
            return ResponseEntity.ok(policy);
        } catch (EntityNotFoundException e) {
            log.error("Error processing Kasko payment - application not found or not owned by user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.error("Error processing Kasko payment - illegal state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/applications/kasko")
    public ResponseEntity<List<KaskoApplication>> getUserKaskoApplications(Authentication auth) {
        log.debug("getUserKaskoApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserKaskoApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserKaskoApplications(auth.getName()));
    }

    @GetMapping("/applications/osago")
    public ResponseEntity<List<OsagoApplication>> getUserOsagoApplications(Authentication auth) {
        log.debug("getUserOsagoApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserOsagoApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserOsagoApplications(auth.getName()));
    }

    @GetMapping("/applications/property")
    public ResponseEntity<List<PropertyApplication>> getUserPropertyApplications(Authentication auth) {
        log.debug("getUserPropertyApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserPropertyApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserPropertyApplications(auth.getName()));
    }

    @GetMapping("/applications/health")
    public ResponseEntity<List<HealthApplication>> getUserHealthApplications(Authentication auth) {
        log.debug("getUserHealthApplications called. Authentication: {}", auth);
        if (auth == null) {
            log.error("Authentication is NULL in getUserHealthApplications");
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserHealthApplications(auth.getName()));
    }

    @GetMapping("/applications/travel")
    public ResponseEntity<List<TravelApplication>> getUserTravelApplications(Authentication auth) {
        log.debug("getUserTravelApplications called. Authentication: {}", auth);
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

    // Claims endpoints
    @GetMapping("/claims/user")
    public ResponseEntity<List<InsuranceClaim>> getUserClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        log.debug("getUserClaims called. Authentication: {}, Page: {}, Size: {}", auth, page, size);
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

    @PostMapping(value = "/claims", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InsuranceClaim> createClaimWithFiles(
            @RequestParam("policyId") Long policyId,
            @RequestParam("description") String description,
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents,
            Authentication auth) {
        log.info("createClaimWithFiles called. Authentication: {}, PolicyId: {}", auth, policyId);
        if (auth == null) {
            log.error("Authentication is NULL in createClaimWithFiles");
            return ResponseEntity.status(500).build();
        }

        InsuranceClaim claim = new InsuranceClaim();
        claim.setDescription(description);
        
        // Find and set the policy
        InsurancePolicy policy = insuranceService.findPolicyById(policyId)
            .orElseThrow(() -> new EntityNotFoundException("Policy not found: " + policyId));
        claim.setPolicy(policy);

        // Create and save the claim
        InsuranceClaim savedClaim = insuranceService.createClaim(claim, auth.getName());

        // Handle file uploads if any
        if (documents != null && !documents.isEmpty()) {
            for (MultipartFile document : documents) {
                try {
                    ClaimAttachment attachment = new ClaimAttachment();
                    attachment.setClaim(savedClaim);
                    attachment.setFileName(document.getOriginalFilename());
                    attachment.setFileType(document.getContentType());
                    attachment.setFileSize(document.getSize());
                    attachment.setUploadedBy(auth.getName());
                    
                    // Save file to disk and store path
                    String filePath = saveFile(document);
                    attachment.setFilePath(filePath);
                    
                    insuranceService.saveAttachment(attachment);
                } catch (IOException e) {
                    log.error("Error saving file: {}", e.getMessage());
                }
            }
        }

        return ResponseEntity.ok(savedClaim);
    }

    private String saveFile(MultipartFile file) throws IOException {
        String uploadDir = "uploads/claims";
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, fileName);
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
        return path.toString();
    }

    @PostMapping("/travel/{applicationId}/pay")
    public ResponseEntity<?> processTravelPayment(@PathVariable Long applicationId, Authentication authentication) {
        log.info("processTravelPayment called for application ID: {}, Authentication: {}", applicationId, authentication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in processTravelPayment");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            InsurancePolicy policy = insuranceService.processTravelPayment(applicationId, authentication.getName());
            return ResponseEntity.ok(policy);
        } catch (EntityNotFoundException e) {
            log.error("Error processing Travel payment - application not found or not owned by user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.error("Error processing Travel payment - illegal state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/property/{applicationId}/pay")
    public ResponseEntity<?> processPropertyPayment(@PathVariable Long applicationId, Authentication authentication) {
        log.info("processPropertyPayment called for application ID: {}, Authentication: {}", applicationId, authentication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in processPropertyPayment");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            InsurancePolicy policy = insuranceService.processPropertyPayment(applicationId, authentication.getName());
            return ResponseEntity.ok(policy);
        } catch (EntityNotFoundException e) {
            log.error("Error processing Property payment - application not found or not owned by user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.error("Error processing Property payment - illegal state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Claim Messages endpoints
    @GetMapping("/claims/{claimId}/messages")
    public ResponseEntity<List<Claims.ClaimMessage>> getClaimMessages(@PathVariable Long claimId, Authentication auth) {
        log.debug("getClaimMessages called. ClaimId: {}, Authentication: {}", claimId, auth);
        if (auth == null) {
            log.error("Authentication is NULL in getClaimMessages");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(insuranceService.getClaimMessages(claimId, auth.getName()));
    }

    @PostMapping("/claims/{claimId}/messages")
    public ResponseEntity<Claims.ClaimMessage> addClaimMessage(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        log.debug("addClaimMessage called. ClaimId: {}, Authentication: {}", claimId, auth);
        if (auth == null) {
            log.error("Authentication is NULL in addClaimMessage");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String message = payload.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(insuranceService.addClaimMessage(claimId, message, auth.getName()));
    }

    @PostMapping("/claims/{claimId}/cancel")
    public ResponseEntity<InsuranceClaim> cancelClaim(@PathVariable Long claimId, Authentication auth) {
        log.debug("cancelClaim called. ClaimId: {}, Authentication: {}", claimId, auth);
        if (auth == null) {
            log.error("Authentication is NULL in cancelClaim");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(insuranceService.cancelClaim(claimId, auth.getName()));
    }
} 