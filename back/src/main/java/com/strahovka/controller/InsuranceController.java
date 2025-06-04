package com.strahovka.controller;

import com.strahovka.delivery.Claims;
import com.strahovka.delivery.Insurance;
import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.Claims.InsuranceClaim;
import com.strahovka.delivery.Claims.ClaimAttachment;
import com.strahovka.delivery.User;
import com.strahovka.enums.Role;
import com.strahovka.service.InsuranceService;
import com.strahovka.repository.UserRepository;
import com.strahovka.service.JwtService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDate;
import java.util.stream.Collectors;
import com.strahovka.dto.UserPackageDetailDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

@Slf4j
@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private String extractEmailFromPayload(Map<String, Object> payload) {
        Object emailObj = payload.get("email");
        if (emailObj == null) {
            throw new IllegalArgumentException("Email is required");
        }
        return emailObj.toString();
    }

    @PostMapping("/guides")
    public ResponseEntity<InsuranceGuide> createGuide(@RequestBody InsuranceGuide guide) {
        return ResponseEntity.ok(insuranceService.createGuide(guide));
    }

    @PutMapping("/guides/{id}")
    public ResponseEntity<InsuranceGuide> updateGuide(@PathVariable Long id, @RequestBody InsuranceGuide guide) {
        return ResponseEntity.ok(insuranceService.updateGuide(id, guide));
    }

    @DeleteMapping("/guides/{id}")
    public ResponseEntity<Void> deleteGuide(@PathVariable Long id) {
        insuranceService.deleteGuide(id);
        return ResponseEntity.ok().build();
    }

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

    @PostMapping("/policies/{policyId}/cancel")
    public ResponseEntity<?> cancelPolicy(
            @PathVariable Long policyId,
            @RequestBody Map<String, String> payload,
            Authentication authentication) {
        log.info("cancelPolicy called for policy ID: {}, by user: {}", policyId, authentication.getName());
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in cancelPolicy");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            String reason = payload.getOrDefault("reason", "Отмена по запросу клиента");
            // Предполагается, что insuranceService.cancelPolicy вернет Map или объект с полями message и refundAmount
            Map<String, Object> result = insuranceService.cancelPolicy(policyId, authentication.getName(), reason);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            log.error("Error cancelling policy - policy not found or not owned by user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.error("Error cancelling policy - illegal state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error cancelling policy: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred while cancelling the policy.");
        }
    }

    // Package endpoints
    @GetMapping("/packages")
    public ResponseEntity<List<InsurancePackage>> getUserPackages(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(insuranceService.getUserPackages(userDetails.getUsername()));
    }

    @GetMapping("/packages/admin")
    public ResponseEntity<List<InsurancePackage>> getAdminPackages(Authentication authentication) {
        if (authentication == null || !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
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
        List<Long> categoryIds = insurancePackage.getCategories() != null ?
                insurancePackage.getCategories().stream().map(InsuranceCategory::getId).collect(Collectors.toList()) :
                List.of();
        return ResponseEntity.ok(insuranceService.createPackage(insurancePackage, userDetails.getUsername(), categoryIds));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<InsurancePackage> updatePackage(
            @PathVariable Long id,
            @RequestBody InsurancePackage insurancePackage) {
        List<Long> categoryIds = insurancePackage.getCategories() != null ?
                insurancePackage.getCategories().stream().map(InsuranceCategory::getId).collect(Collectors.toList()) :
                List.of();
        return ResponseEntity.ok(insuranceService.updatePackage(id, insurancePackage, categoryIds));
    }

    @GetMapping("/packages/{id}")
    public ResponseEntity<InsurancePackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(insuranceService.getPackageById(id));
    }

    @DeleteMapping("/packages/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        insuranceService.deletePackage(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/packages/user/details")
    public ResponseEntity<List<UserPackageDetailDTO>> getUserPackageDetails(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        List<UserPackageDetailDTO> packageDetails = insuranceService.getUserPackageDetails(userDetails.getUsername());
        return ResponseEntity.ok(packageDetails);
    }

    @PostMapping("/packages/{packageId}/apply")
    public ResponseEntity<?> applyForPackage(
            @PathVariable Long packageId,
            @RequestBody com.strahovka.dto.PackageApplyRequest packageApplyRequest,
            @AuthenticationPrincipal UserDetails userDetails) {
        String authenticatedUserEmail = (userDetails != null) ? userDetails.getUsername() : null;
        try {
            InsurancePackage processedPackage = insuranceService.processPackageApplication(packageId, packageApplyRequest.getApplications(), authenticatedUserEmail);
            return ResponseEntity.ok(processedPackage); // Можно вернуть более специфичный DTO ответа
        } catch (EntityNotFoundException e) {
            log.warn("Not found during package application for packageId {}: {}", packageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("Bad request during package application for packageId {}: {}", packageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing package application for packageId {}: {}", packageId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Внутренняя ошибка сервера при обработке пакета."));
        }
    }

    @PostMapping("/packages/{packageId}/process-payment")
    @Operation(summary = "Process payment for an entire insurance package", description = "Marks all applications in the package as paid and generates policies.")
    public ResponseEntity<?> processPackagePayment(
            @Parameter(description = "ID of the package to process payment for") @PathVariable Long packageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            insuranceService.processPackagePayment(packageId, userDetails.getUsername());
            return ResponseEntity.ok().body(Map.of("message", "Package payment processed successfully. Policies are being generated."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error processing package payment for package ID: {}", packageId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred while processing package payment."));
        }
    }

    @PostMapping("/packages/{packageId}/finalize")
    @Operation(summary = "Финализация страхового пакета", description = "Завершает оформление пакета и создает все необходимые страховые полисы")
    public ResponseEntity<?> finalizePackage(
            @Parameter(description = "ID пакета для финализации") @PathVariable Long packageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            insuranceService.processPackagePayment(packageId, userDetails.getUsername());
            return ResponseEntity.ok().body(Map.of("message", "Пакет успешно финализирован. Страховые полисы созданы."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Ошибка при финализации пакета ID: {}", packageId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Произошла непредвиденная ошибка при финализации пакета."));
        }
    }

    @PostMapping("/packages/{packageId}/cancel")
    @Operation(summary = "Cancel an insurance package", description = "Cancels an insurance package and all its applications")
    public ResponseEntity<?> cancelPackage(
            @Parameter(description = "ID of the package to cancel") @PathVariable Long packageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        try {
            InsurancePackage cancelledPackage = insuranceService.cancelPackage(packageId, userDetails.getUsername());
            return ResponseEntity.ok().body(Map.of(
                "message", "Package cancelled successfully",
                "packageId", cancelledPackage.getId(),
                "status", cancelledPackage.getStatus()
            ));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelling package ID: {}", packageId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while cancelling the package."));
        }
    }

    // Application endpoints
    @PostMapping("/applications/kasko")
    public ResponseEntity<Insurance.KaskoApplication> createKaskoApplication(@RequestBody Insurance.KaskoApplication application, Authentication authentication) {
        log.info("createKaskoApplication called. Authentication: {}, Payload: {}", authentication, application);
        Insurance.KaskoApplication createdApplication = insuranceService.createKaskoApplication(application, authentication.getName());
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/osago")
    public ResponseEntity<Insurance.OsagoApplication> createOsagoApplication(@RequestBody Insurance.OsagoApplication application, Authentication authentication) {
        log.info("createOsagoApplication called. Authentication: {}, Payload: {}", authentication, application);
        Insurance.OsagoApplication createdApplication = insuranceService.createOsagoApplication(application, authentication.getName());
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/travel")
    public ResponseEntity<Insurance.TravelApplication> createTravelApplication(@RequestBody Insurance.TravelApplication application, Authentication authentication) {
        Insurance.TravelApplication createdApplication = insuranceService.createTravelApplication(application, authentication.getName());
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/health")
    public ResponseEntity<Insurance.HealthApplication> createHealthApplication(@RequestBody Insurance.HealthApplication application, Authentication authentication) {
        log.info("createHealthApplication called. Authentication: {}, Payload: {}", authentication, application);
        Insurance.HealthApplication createdApplication = insuranceService.createHealthApplication(application, authentication.getName());
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/property")
    public ResponseEntity<Insurance.PropertyApplication> createPropertyApplication(@RequestBody Insurance.PropertyApplication application, Authentication authentication) {
        log.info("createPropertyApplication called. Authentication: {}, Payload: {}", authentication, application);
        Insurance.PropertyApplication createdApplication = insuranceService.createPropertyApplication(application, authentication.getName());
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/health/{applicationId}/pay")
    public ResponseEntity<?> processHealthPayment(@PathVariable Long applicationId, Authentication authentication) {
        log.info("Processing Health payment for application ID: {} by user: {}", applicationId, authentication.getName());
        try {
            InsurancePolicy policy = insuranceService.processHealthPayment(applicationId, authentication.getName());
            return ResponseEntity.ok(policy);
        } catch (EntityNotFoundException e) {
            log.error("Error processing Health payment - application not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.error("Error processing Health payment - illegal state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error processing Health payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    @PostMapping("/osago/{applicationId}/pay")
    public ResponseEntity<?> processOsagoPayment(@PathVariable Long applicationId, Authentication authentication) {
        log.info("Processing OSAGO payment for application ID: {} by user: {}", applicationId, authentication.getName());
        try {
            InsurancePolicy policy = insuranceService.processOsagoPayment(applicationId, authentication.getName());
            return ResponseEntity.ok(policy);
        } catch (EntityNotFoundException e) {
            log.error("Error processing OSAGO payment - application not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            log.error("Error processing OSAGO payment - illegal state: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error processing OSAGO payment: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
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
    public ResponseEntity<List<KaskoApplication>> getKaskoApplications(Authentication authentication) {
        log.info("getKaskoApplications called. Authentication: {}", authentication);
        List<KaskoApplication> applications = insuranceService.getKaskoApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/osago")
    public ResponseEntity<List<OsagoApplication>> getOsagoApplications(Authentication authentication) {
        log.info("getOsagoApplications called. Authentication: {}", authentication);
        List<OsagoApplication> applications = insuranceService.getOsagoApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/property")
    public ResponseEntity<List<PropertyApplication>> getPropertyApplications(Authentication authentication) {
        log.info("getPropertyApplications called. Authentication: {}", authentication);
        List<PropertyApplication> applications = insuranceService.getPropertyApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/health")
    public ResponseEntity<List<HealthApplication>> getHealthApplications(Authentication authentication) {
        log.info("getHealthApplications called. Authentication: {}", authentication);
        List<HealthApplication> applications = insuranceService.getHealthApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/travel")
    public ResponseEntity<List<TravelApplication>> getTravelApplications(Authentication authentication) {
        log.info("getTravelApplications called. Authentication: {}", authentication);
        List<TravelApplication> applications = insuranceService.getTravelApplications(authentication);
        return ResponseEntity.ok(applications);
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
                    attachment.setUploadedBy(userRepository.findByEmail(auth.getName())
                            .orElseThrow(() -> new EntityNotFoundException("User not found: " + auth.getName())));
                    
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

    @PostMapping("/unauthorized/kasko")
    public ResponseEntity<?> createUnauthorizedKaskoApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user information
            String userEmail = extractEmailFromPayload(payload);
            String password = (String) payload.get("password");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String phone = (String) payload.get("phone");

            // Create or get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(userEmail);
                        newUser.setPassword(passwordEncoder.encode(password));
                        newUser.setFirstName(firstName);
                        newUser.setLastName(lastName);
                        newUser.setPhone(phone);
                        newUser.setRole(Role.USER);
                        return userRepository.save(newUser);
                    });

            // Create KASKO application
            KaskoApplication application = new KaskoApplication();
            application.setCarMake((String) payload.get("carMake"));
            application.setCarModel((String) payload.get("carModel"));
            application.setCarYear((Integer) payload.get("carYear"));
            application.setVinNumber((String) payload.get("vinNumber"));
            application.setLicensePlate((String) payload.get("licensePlate"));
            application.setCarValue(new BigDecimal(payload.get("carValue").toString()));
            application.setDriverLicenseNumber((String) payload.get("driverLicenseNumber"));
            application.setDriverExperienceYears((Integer) payload.get("driverExperienceYears"));
            application.setHasAntiTheftSystem((Boolean) payload.get("hasAntiTheftSystem"));
            application.setGarageParking((Boolean) payload.get("garageParking"));
            application.setPreviousInsuranceNumber((String) payload.get("previousInsuranceNumber"));
            application.setDuration((Integer) payload.get("duration"));

            KaskoApplication createdApplication = insuranceService.createKaskoApplication(application, userEmail);

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("application", createdApplication);
            response.put("token", jwtToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized KASKO application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create KASKO application: " + e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/osago")
    public ResponseEntity<?> createUnauthorizedOsagoApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user information
            String userEmail = extractEmailFromPayload(payload);
            String password = (String) payload.get("password");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String phone = (String) payload.get("phone");

            // Create or get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(userEmail);
                        newUser.setPassword(passwordEncoder.encode(password));
                        newUser.setFirstName(firstName);
                        newUser.setLastName(lastName);
                        newUser.setPhone(phone);
                        newUser.setRole(Role.USER);
                        return userRepository.save(newUser);
                    });

            // Create OSAGO application
            OsagoApplication application = new OsagoApplication();
            application.setCarMake((String) payload.get("carMake"));
            application.setCarModel((String) payload.get("carModel"));
            application.setCarYear((Integer) payload.get("carYear"));
            application.setVinNumber((String) payload.get("vinNumber"));
            application.setLicensePlate((String) payload.get("licensePlate"));
            application.setRegistrationCertificate((String) payload.get("registrationCertificate"));
            application.setDriverLicenseNumber((String) payload.get("driverLicenseNumber"));
            application.setDriverExperienceYears((Integer) payload.get("driverExperienceYears"));
            application.setEnginePower((Integer) payload.get("enginePower"));
            application.setRegionRegistration((String) payload.get("regionRegistration"));
            application.setHasAccidentsLastYear((Boolean) payload.get("hasAccidentsLastYear"));
            application.setPreviousPolicyNumber((String) payload.get("previousPolicyNumber"));
            application.setIsUnlimitedDrivers((Boolean) payload.get("isUnlimitedDrivers"));
            application.setDuration((Integer) payload.get("duration"));

            OsagoApplication createdApplication = insuranceService.createOsagoApplication(application, userEmail);

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("application", createdApplication);
            response.put("token", jwtToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized OSAGO application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create OSAGO application: " + e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/property")
    public ResponseEntity<?> createUnauthorizedPropertyApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user information
            String userEmail = extractEmailFromPayload(payload);
            String password = (String) payload.get("password");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String phone = (String) payload.get("phone");

            // Create or get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(userEmail);
                        newUser.setPassword(passwordEncoder.encode(password));
                        newUser.setFirstName(firstName);
                        newUser.setLastName(lastName);
                        newUser.setPhone(phone);
                        newUser.setRole(Role.USER);
                        return userRepository.save(newUser);
                    });

            // Create Property application
            PropertyApplication application = new PropertyApplication();
            application.setPropertyType((String) payload.get("propertyType"));
            application.setAddress((String) payload.get("propertyAddress"));
            application.setPropertyArea(new BigDecimal(payload.get("propertyArea").toString()));
            application.setYearBuilt((Integer) payload.get("yearBuilt"));
            application.setConstructionType((String) payload.get("constructionType"));
            application.setPropertyValue(new BigDecimal(payload.get("propertyValue").toString()));
            application.setHasSecuritySystem((Boolean) payload.get("hasSecuritySystem"));
            application.setHasFireAlarm((Boolean) payload.get("hasFireAlarm"));
            application.setCoverNaturalDisasters((Boolean) payload.get("coverNaturalDisasters"));
            application.setCoverTheft((Boolean) payload.get("coverTheft"));
            application.setCoverThirdPartyLiability((Boolean) payload.get("coverThirdPartyLiability"));
            application.setOwnershipDocumentNumber((String) payload.get("ownershipDocumentNumber"));
            application.setCadastralNumber((String) payload.get("cadastralNumber"));
            application.setHasMortgage((Boolean) payload.get("hasMortage"));
            application.setMortgageBank((String) payload.get("mortageBank"));

            PropertyApplication createdApplication = insuranceService.createPropertyApplication(application, userEmail);

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("application", createdApplication);
            response.put("token", jwtToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized Property application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Property application: " + e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/health")
    public ResponseEntity<?> createUnauthorizedHealthApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user information
            String userEmail = extractEmailFromPayload(payload);
            String password = (String) payload.get("password");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String phone = (String) payload.get("phone");

            // Create or get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(userEmail);
                        newUser.setPassword(passwordEncoder.encode(password));
                        newUser.setFirstName(firstName);
                        newUser.setLastName(lastName);
                        newUser.setPhone(phone);
                        newUser.setRole(Role.USER);
                        return userRepository.save(newUser);
                    });

            // Create Health application
            HealthApplication application = new HealthApplication();
            application.setBirthDate(LocalDate.parse((String) payload.get("dateOfBirth")));
            application.setPassportNumber((String) payload.get("passportNumber"));
            application.setSnils((String) payload.get("snils"));
            application.setHasChronicDiseases((Boolean) payload.get("hasChronicDiseases"));
            application.setChronicDiseasesDetails((String) payload.get("chronicDiseases"));
            application.setHasDisabilities((Boolean) payload.get("hasDangerousHobbies"));
            application.setDisabilitiesDetails((String) payload.get("dangerousHobbies"));
            application.setSmokingStatus((Boolean) payload.get("smokingStatus"));
            application.setCoverDental((Boolean) payload.get("coverDental"));
            application.setCoverVision((Boolean) payload.get("coverVision"));
            application.setCoverMaternity((Boolean) payload.get("coverMaternity"));
            application.setCoverEmergency((Boolean) payload.get("coverEmergency"));
            application.setPreferredClinic((String) payload.get("preferredClinic"));
            application.setFamilyDoctorNeeded((Boolean) payload.get("familyDoctorNeeded"));

            HealthApplication createdApplication = insuranceService.createHealthApplication(application, userEmail);

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("application", createdApplication);
            response.put("token", jwtToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized Health application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Health application: " + e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/travel")
    public ResponseEntity<?> createUnauthorizedTravelApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user information
            String userEmail = extractEmailFromPayload(payload);
            String password = (String) payload.get("password");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String phone = (String) payload.get("phone");

            // Create or get user
            User user = userRepository.findByEmail(userEmail)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setEmail(userEmail);
                        newUser.setPassword(passwordEncoder.encode(password));
                        newUser.setFirstName(firstName);
                        newUser.setLastName(lastName);
                        newUser.setPhone(phone);
                        newUser.setRole(Role.USER);
                        return userRepository.save(newUser);
                    });

            // Create Travel application
            TravelApplication application = new TravelApplication();
            application.setPassportNumber((String) payload.get("passportNumber"));
            application.setPassportExpiry(LocalDate.parse((String) payload.get("passportExpiry")));
            application.setDestinationCountry((String) payload.get("destinationCountry"));
            application.setTravelStartDate(LocalDate.parse((String) payload.get("travelStartDate")));
            application.setTravelEndDate(LocalDate.parse((String) payload.get("travelEndDate")));
            application.setPurposeOfTrip((String) payload.get("purposeOfTrip"));
            application.setHasChronicDiseases((Boolean) payload.get("hasChronicDiseases"));
            application.setCoverMedicalExpenses((Boolean) payload.get("coverMedicalExpenses"));
            application.setCoverAccidents((Boolean) payload.get("coverAccidents"));
            application.setCoverLuggage((Boolean) payload.get("coverLuggage"));
            application.setCoverTripCancellation((Boolean) payload.get("coverTripCancellation"));
            application.setCoverSportsActivities((Boolean) payload.get("coverSportsActivities"));
            application.setPlannedSportsActivities((String) payload.get("plannedSportsActivities"));

            TravelApplication createdApplication = insuranceService.createTravelApplication(application, userEmail);

            // Generate JWT token
            String jwtToken = jwtService.generateToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("application", createdApplication);
            response.put("token", jwtToken);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized Travel application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Travel application: " + e.getMessage()));
        }
    }
} 