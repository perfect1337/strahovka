package com.strahovka.controller;

import com.strahovka.entity.Claims;
import com.strahovka.entity.Insurance;
import com.strahovka.entity.Insurance.*;
import com.strahovka.entity.InsurancePolicy;
import com.strahovka.entity.Claims.InsuranceClaim;
import com.strahovka.entity.Claims.ClaimAttachment;
import com.strahovka.dto.KaskoApplicationRequest;
import com.strahovka.dto.LoginResponse;
import com.strahovka.dto.OsagoApplicationRequest;
import com.strahovka.service.InsuranceService;
import com.strahovka.repository.UserRepository;
import com.strahovka.service.JwtService;
import com.strahovka.service.AuthService;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
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
    private final AuthService authService;

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

    @GetMapping("/policies")
    public ResponseEntity<List<InsurancePolicy>> getUserPolicies(@AuthenticationPrincipal UserDetails userDetails) {
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
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }
        try {
            String reason = payload.getOrDefault("reason", "Отмена по запросу клиента");
            Map<String, Object> result = insuranceService.cancelPolicy(policyId, authentication.getName(), reason);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("exception serv");
        }
    }

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
            return ResponseEntity.ok(processedPackage);
        } catch (Exception e) {
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
        }  catch (Exception e) {
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
        } catch (Exception e) {
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
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred while cancelling the package."));
        }
    }

    @PostMapping("/applications/kasko")
    public ResponseEntity<KaskoApplication> createKaskoApplication(
            @RequestBody KaskoApplication application,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        if (userEmailForService == null && (application.getEmail() == null || application.getEmail().trim().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build(); 
        }
        KaskoApplication createdApplication = insuranceService.createKaskoApplication(application, userEmailForService);
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/osago")
    public ResponseEntity<Insurance.OsagoApplication> createOsagoApplication(
            @RequestBody Insurance.OsagoApplication application, 
            @AuthenticationPrincipal UserDetails userDetails) {

        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        if (userEmailForService == null && (application.getEmail() == null || application.getEmail().trim().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        Insurance.OsagoApplication createdApplication = insuranceService.createOsagoApplication(application, userEmailForService);
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/travel")
    public ResponseEntity<Insurance.TravelApplication> createTravelApplication(
            @RequestBody Insurance.TravelApplication application, 
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        if (userEmailForService == null && (application.getEmail() == null || application.getEmail().trim().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        Insurance.TravelApplication createdApplication = insuranceService.createTravelApplication(application, userEmailForService);
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/health")
    public ResponseEntity<Insurance.HealthApplication> createHealthApplication(
            @RequestBody Insurance.HealthApplication application, 
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;

        if (userEmailForService == null && (application.getEmail() == null || application.getEmail().trim().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        Insurance.HealthApplication createdApplication = insuranceService.createHealthApplication(application, userEmailForService);
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/applications/property")
    public ResponseEntity<Insurance.PropertyApplication> createPropertyApplication(
            @RequestBody Insurance.PropertyApplication application, 
            @AuthenticationPrincipal UserDetails userDetails) {
        
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;

        if (userEmailForService == null && (application.getEmail() == null || application.getEmail().trim().isEmpty())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Insurance.PropertyApplication createdApplication = insuranceService.createPropertyApplication(application, userEmailForService);
        return ResponseEntity.ok(createdApplication);
    }

    @PostMapping("/health/{applicationId}/pay")
    public ResponseEntity<?> processHealthPayment(@PathVariable Long applicationId, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        log.info("processHealthPayment called for app ID: {}. Auth email: {}", applicationId, userEmailForService);
        try {
            InsurancePolicy policy = insuranceService.processHealthPayment(applicationId, userEmailForService);
            return ResponseEntity.ok(policy);
        } catch (Exception e) {
            log.error("Error in processHealthPayment for app {}: {}", applicationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error."));
        }
    }

    @PostMapping("/osago/{applicationId}/pay")
    public ResponseEntity<?> processOsagoPayment(@PathVariable Long applicationId, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        log.info("processOsagoPayment called for app ID: {}. Auth email: {}", applicationId, userEmailForService);
        try {
            InsurancePolicy policy = insuranceService.processOsagoPayment(applicationId, userEmailForService);
            return ResponseEntity.ok(policy);
        }  catch (Exception e) {
            log.error("Error in processOsagoPayment for app {}: {}", applicationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error."));
        }
    }

    @PostMapping("/kasko/{applicationId}/pay")
    public ResponseEntity<?> processKaskoPayment(@PathVariable Long applicationId, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        try {
            InsurancePolicy policy = insuranceService.processKaskoPayment(applicationId, userEmailForService);
            return ResponseEntity.ok(policy);
        }  catch (Exception e) {
            log.error("Error in processKaskoPayment for app {}: {}", applicationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error."));
        }
    }

    @PostMapping("/travel/{applicationId}/pay")
    public ResponseEntity<?> processTravelPayment(@PathVariable Long applicationId, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        try {
            InsurancePolicy policy = insuranceService.processTravelPayment(applicationId, userEmailForService);
            return ResponseEntity.ok(policy);
        }  catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error."));
        }
    }

    @PostMapping("/property/{applicationId}/pay")
    public ResponseEntity<?> processPropertyPayment(@PathVariable Long applicationId, @AuthenticationPrincipal UserDetails userDetails) {
        String userEmailForService = (userDetails != null) ? userDetails.getUsername() : null;
        try {
            InsurancePolicy policy = insuranceService.processPropertyPayment(applicationId, userEmailForService);
            return ResponseEntity.ok(policy);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error."));
        }
    }

    @GetMapping("/applications/kasko")
    public ResponseEntity<List<KaskoApplication>> getKaskoApplications(Authentication authentication) {
        List<KaskoApplication> applications = insuranceService.getKaskoApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/osago")
    public ResponseEntity<List<OsagoApplication>> getOsagoApplications(Authentication authentication) {
        List<OsagoApplication> applications = insuranceService.getOsagoApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/property")
    public ResponseEntity<List<PropertyApplication>> getPropertyApplications(Authentication authentication) {
        List<PropertyApplication> applications = insuranceService.getPropertyApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/health")
    public ResponseEntity<List<HealthApplication>> getHealthApplications(Authentication authentication) {
        List<HealthApplication> applications = insuranceService.getHealthApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @GetMapping("/applications/travel")
    public ResponseEntity<List<TravelApplication>> getTravelApplications(Authentication authentication) {
        List<TravelApplication> applications = insuranceService.getTravelApplications(authentication);
        return ResponseEntity.ok(applications);
    }

    @DeleteMapping("/applications/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        insuranceService.deleteApplication(id);
        return ResponseEntity.ok().build();
    }

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

    @GetMapping("/claims/user")
    public ResponseEntity<List<InsuranceClaim>> getUserClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        log.debug("getUserClaims called. Authentication: {}, Page: {}, Size: {}", auth, page, size);
        if (auth == null) {
            return ResponseEntity.status(500).build();
        }
        return ResponseEntity.ok(insuranceService.getUserClaims(auth.getName(), page, size));
    }

    @PostMapping("/claims")
    public ResponseEntity<InsuranceClaim> createClaim(@RequestBody InsuranceClaim claim, Authentication auth) {
        if (auth == null) {
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
        if (auth == null) {
            return ResponseEntity.status(500).build();
        }

        InsuranceClaim claim = new InsuranceClaim();
        claim.setDescription(description);
        
        InsurancePolicy policy = insuranceService.findPolicyById(policyId)
            .orElseThrow(() -> new EntityNotFoundException("Policy not found: " + policyId));
        claim.setPolicy(policy);

        InsuranceClaim savedClaim = insuranceService.createClaim(claim, auth.getName());

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


    @GetMapping("/claims/{claimId}/messages")
    public ResponseEntity<List<Claims.ClaimMessage>> getClaimMessages(@PathVariable Long claimId, Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(insuranceService.getClaimMessages(claimId, auth.getName()));
    }

    @PostMapping("/claims/{claimId}/messages")
    public ResponseEntity<Claims.ClaimMessage> addClaimMessage(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        if (auth == null) {
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
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(insuranceService.cancelClaim(claimId, auth.getName()));
    }

    @PostMapping("/kasko/unauthorized")
    public ResponseEntity<?> createKaskoApplicationUnauthorized(@RequestBody KaskoApplicationRequest request) {
        LoginResponse loginResponse = authService.registerAndLogin(request.getEmail());
        KaskoApplication application = insuranceService.createKaskoApplication(request.toKaskoApplication(), request.getEmail());
        return ResponseEntity.ok(Map.of(
            "application", application,
            "auth", loginResponse
        ));
    }

    @PostMapping("/osago/unauthorized")
    public ResponseEntity<?> createOsagoApplicationUnauthorized(@RequestBody OsagoApplicationRequest request) {
        LoginResponse loginResponse = authService.registerAndLogin(request.getEmail());
        OsagoApplication application = insuranceService.createOsagoApplication(request.toOsagoApplication(), request.getEmail());
        return ResponseEntity.ok(Map.of(
            "application", application,
            "auth", loginResponse
        ));
    }

    @PostMapping("/travel/unauthorized")
    public ResponseEntity<?> createTravelApplicationUnauthorized(@RequestBody TravelApplication request) {
        LoginResponse loginResponse = authService.registerAndLogin(request.getEmail());
        TravelApplication application = insuranceService.createTravelApplication(request, request.getEmail());
        return ResponseEntity.ok(Map.of(
            "application", application,
            "auth", loginResponse
        ));
    }

    @PostMapping("/health/unauthorized")
    public ResponseEntity<?> createHealthApplicationUnauthorized(@RequestBody HealthApplication request) {
        LoginResponse loginResponse = authService.registerAndLogin(request.getEmail());
        HealthApplication application = insuranceService.createHealthApplication(request, request.getEmail());
        return ResponseEntity.ok(Map.of(
            "application", application,
            "auth", loginResponse
        ));
    }

    @PostMapping("/property/unauthorized")
    public ResponseEntity<?> createPropertyApplicationUnauthorized(@RequestBody PropertyApplication request) {
        LoginResponse loginResponse = authService.registerAndLogin(request.getEmail());
        PropertyApplication application = insuranceService.createPropertyApplication(request, request.getEmail());
        return ResponseEntity.ok(Map.of(
            "application", application,
            "auth", loginResponse
        ));
    }
} 