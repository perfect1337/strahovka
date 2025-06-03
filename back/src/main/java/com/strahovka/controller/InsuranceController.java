package com.strahovka.controller;

import com.strahovka.delivery.Claims;
import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.Claims.InsuranceClaim;
import com.strahovka.entity.ClaimStatus;
import com.strahovka.delivery.Claims.ClaimAttachment;
import com.strahovka.delivery.User;
import com.strahovka.entity.Role;
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

@Slf4j
@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {
    private final InsuranceService insuranceService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


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

    @PostMapping("/applications/osago")
    public ResponseEntity<OsagoApplication> createOsagoApplication(
            @RequestBody OsagoApplication osagoApplication,
            Authentication authentication) {
        log.info("createOsagoApplication called. Authentication: {}, Payload: {}", authentication, osagoApplication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in createOsagoApplication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Предполагается, что в insuranceService есть метод createOsagoApplication
        OsagoApplication createdApplication = insuranceService.createOsagoApplication(osagoApplication, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    @PostMapping("/applications/travel")
    public ResponseEntity<TravelApplication> createTravelApplication(
            @RequestBody TravelApplication travelApplication,
            Authentication authentication) {
        log.info("createTravelApplication called. Authentication: {}, Payload: {}", authentication, travelApplication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in createTravelApplication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        TravelApplication createdApplication = insuranceService.createTravelApplication(travelApplication, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    @PostMapping("/applications/health")
    public ResponseEntity<HealthApplication> createHealthApplication(
            @RequestBody HealthApplication healthApplication,
            Authentication authentication) {
        log.info("createHealthApplication called. Authentication: {}, Payload: {}", authentication, healthApplication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in createHealthApplication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        HealthApplication createdApplication = insuranceService.createHealthApplication(healthApplication, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
    }

    @PostMapping("/applications/property")
    public ResponseEntity<PropertyApplication> createPropertyApplication(
            @RequestBody PropertyApplication propertyApplication,
            Authentication authentication) {
        log.info("createPropertyApplication called. Authentication: {}, Payload: {}", authentication, propertyApplication);
        if (authentication == null || authentication.getName() == null) {
            log.error("Authentication is NULL or user is not authenticated in createPropertyApplication");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        PropertyApplication createdApplication = insuranceService.createPropertyApplication(propertyApplication, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdApplication);
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

    @PostMapping("/unauthorized/kasko")
    public ResponseEntity<?> createUnauthorizedKaskoApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user registration data
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String middleName = (String) payload.get("middleName");

            // Create user first
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
            }

            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .firstName(firstName)
                    .lastName(lastName)
                    .middleName(middleName)
                    .role(Role.USER)
                    .build();
            user = userRepository.save(user);

            // Create KASKO application
            KaskoApplication kaskoApplication = new KaskoApplication();
            kaskoApplication.setCarMake((String) payload.get("carMake"));
            kaskoApplication.setCarModel((String) payload.get("carModel"));
            kaskoApplication.setCarYear(Integer.parseInt(payload.get("carYear").toString()));
            kaskoApplication.setVinNumber((String) payload.get("vinNumber"));
            kaskoApplication.setLicensePlate((String) payload.get("licensePlate"));
            kaskoApplication.setCarValue(new BigDecimal(payload.get("carValue").toString()));
            kaskoApplication.setDriverLicenseNumber((String) payload.get("driverLicenseNumber"));
            kaskoApplication.setDriverExperienceYears(Integer.parseInt(payload.get("driverExperienceYears").toString()));
            kaskoApplication.setHasAntiTheftSystem(Boolean.parseBoolean(payload.get("hasAntiTheftSystem").toString()));
            kaskoApplication.setGarageParking(Boolean.parseBoolean(payload.get("garageParking").toString()));
            kaskoApplication.setPreviousInsuranceNumber((String) payload.get("previousInsuranceNumber"));
            kaskoApplication.setDuration(Integer.parseInt(payload.get("duration").toString()));

            KaskoApplication createdApplication = insuranceService.createKaskoApplication(kaskoApplication, email);

            // Generate tokens for the new user
            String accessToken = jwtService.generateToken(email);
            String refreshToken = jwtService.generateRefreshToken(email);
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            // Return response with application, user details and tokens
            Map<String, Object> response = new HashMap<>();
            response.put("id", createdApplication.getId());
            response.put("calculatedAmount", createdApplication.getCalculatedAmount());
            response.put("email", email);
            response.put("password", password);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", user);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized KASKO application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/osago")
    public ResponseEntity<?> createUnauthorizedOsagoApplication(@RequestBody Map<String, Object> payload) {
        try {
            // Extract user registration data
            String email = (String) payload.get("email");
            // String password = (String) payload.get("password"); // Пароль будет равен email
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String middleName = (String) payload.get("middleName");

            // Create user first
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
            }

            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(email)) // Пароль равен почте
                    .firstName(firstName)
                    .lastName(lastName)
                    .middleName(middleName)
                    .role(Role.USER)
                    .build();
            user = userRepository.save(user);

            // Create OSAGO application
            OsagoApplication osagoApplication = new OsagoApplication();

            // Car details
            if (payload.get("carMake") != null) osagoApplication.setCarMake((String) payload.get("carMake"));
            if (payload.get("carModel") != null) osagoApplication.setCarModel((String) payload.get("carModel"));
            if (payload.get("carYear") != null) osagoApplication.setCarYear(Integer.parseInt(payload.get("carYear").toString()));
            if (payload.get("vinNumber") != null) osagoApplication.setVinNumber((String) payload.get("vinNumber"));
            if (payload.get("licensePlate") != null) osagoApplication.setLicensePlate((String) payload.get("licensePlate"));
            if (payload.get("enginePower") != null) osagoApplication.setEnginePower(Integer.parseInt(payload.get("enginePower").toString()));
            if (payload.get("registrationCertificate") != null) osagoApplication.setRegistrationCertificate((String) payload.get("registrationCertificate"));
            if (payload.get("regionRegistration") != null) osagoApplication.setRegionRegistration((String) payload.get("regionRegistration"));
            
            // Driver details (assuming these are for the main driver or applicant)
            // The OsagoApplication entity has driverLicenseNumber and driverExperienceYears directly
            if (payload.get("driverLicenseNumber") != null) osagoApplication.setDriverLicenseNumber((String) payload.get("driverLicenseNumber"));
            else if (payload.get("firstDriverLicenseNumber") != null) osagoApplication.setDriverLicenseNumber((String) payload.get("firstDriverLicenseNumber"));

            if (payload.get("driverExperienceYears") != null) osagoApplication.setDriverExperienceYears(Integer.parseInt(payload.get("driverExperienceYears").toString()));
            else if (payload.get("firstDriverExperienceYears") != null) osagoApplication.setDriverExperienceYears(Integer.parseInt(payload.get("firstDriverExperienceYears").toString()));

            if (payload.get("isUnlimitedDrivers") != null) osagoApplication.setIsUnlimitedDrivers(Boolean.parseBoolean(payload.get("isUnlimitedDrivers").toString()));
            
            // Insurance period and other details
            if (payload.get("startDate") != null) osagoApplication.setStartDate(LocalDate.parse(payload.get("startDate").toString()));
            if (payload.get("endDate") != null) osagoApplication.setEndDate(LocalDate.parse(payload.get("endDate").toString()));
            if (payload.get("duration") != null) osagoApplication.setDuration(Integer.parseInt(payload.get("duration").toString())); // Mapped to 'duration_months' in entity

            if (payload.get("hasAccidentsLastYear") != null) osagoApplication.setHasAccidentsLastYear(Boolean.parseBoolean(payload.get("hasAccidentsLastYear").toString()));
            if (payload.get("previousPolicyNumber") != null) osagoApplication.setPreviousPolicyNumber((String) payload.get("previousPolicyNumber"));
            if (payload.get("notes") != null) osagoApplication.setNotes((String) payload.get("notes"));


            OsagoApplication createdApplication = insuranceService.createOsagoApplication(osagoApplication, email);

            // Generate tokens for the new user
            String accessToken = jwtService.generateToken(email);
            String refreshToken = jwtService.generateRefreshToken(email);
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            // Return response with application, user details and tokens
            Map<String, Object> response = new HashMap<>();
            response.put("id", createdApplication.getId());
            response.put("calculatedAmount", createdApplication.getCalculatedAmount());
            response.put("email", email);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", Map.of("id", user.getId(), "email", user.getEmail(), "firstName", user.getFirstName(), "lastName", user.getLastName(), "middleName", user.getMiddleName(), "role", user.getRole()));


            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized OSAGO application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/property")
    public ResponseEntity<?> createUnauthorizedPropertyApplication(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String middleName = (String) payload.get("middleName");

            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
            }

            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(email))
                    .firstName(firstName)
                    .lastName(lastName)
                    .middleName(middleName)
                    .role(Role.USER)
                    .build();
            user = userRepository.save(user);

            PropertyApplication propertyApplication = new PropertyApplication();
            if (payload.get("propertyType") != null) propertyApplication.setPropertyType((String) payload.get("propertyType"));
            if (payload.get("address") != null) propertyApplication.setAddress((String) payload.get("address"));
            if (payload.get("propertyArea") != null) propertyApplication.setPropertyArea(new BigDecimal(payload.get("propertyArea").toString()));
            if (payload.get("yearBuilt") != null) propertyApplication.setYearBuilt(Integer.parseInt(payload.get("yearBuilt").toString()));
            if (payload.get("constructionType") != null) propertyApplication.setConstructionType((String) payload.get("constructionType"));
            if (payload.get("propertyValue") != null) propertyApplication.setPropertyValue(new BigDecimal(payload.get("propertyValue").toString()));
            if (payload.get("hasSecuritySystem") != null) propertyApplication.setHasSecuritySystem(Boolean.parseBoolean(payload.get("hasSecuritySystem").toString()));
            if (payload.get("hasFireAlarm") != null) propertyApplication.setHasFireAlarm(Boolean.parseBoolean(payload.get("hasFireAlarm").toString()));
            if (payload.get("coverNaturalDisasters") != null) propertyApplication.setCoverNaturalDisasters(Boolean.parseBoolean(payload.get("coverNaturalDisasters").toString()));
            if (payload.get("coverTheft") != null) propertyApplication.setCoverTheft(Boolean.parseBoolean(payload.get("coverTheft").toString()));
            if (payload.get("coverThirdPartyLiability") != null) propertyApplication.setCoverThirdPartyLiability(Boolean.parseBoolean(payload.get("coverThirdPartyLiability").toString()));
            if (payload.get("ownershipDocumentNumber") != null) propertyApplication.setOwnershipDocumentNumber((String) payload.get("ownershipDocumentNumber"));
            if (payload.get("cadastralNumber") != null) propertyApplication.setCadastralNumber((String) payload.get("cadastralNumber"));
            if (payload.get("hasMortgage") != null) propertyApplication.setHasMortgage(Boolean.parseBoolean(payload.get("hasMortgage").toString()));
            if (payload.get("mortgageBank") != null) propertyApplication.setMortgageBank((String) payload.get("mortgageBank"));
            // Даты, если они есть в PropertyApplication и передаются из payload
            // if (payload.get("startDate") != null) propertyApplication.setStartDate(LocalDate.parse(payload.get("startDate").toString()));
            // if (payload.get("endDate") != null) propertyApplication.setEndDate(LocalDate.parse(payload.get("endDate").toString()));

            PropertyApplication createdApplication = insuranceService.createPropertyApplication(propertyApplication, email);

            String accessToken = jwtService.generateToken(email);
            String refreshToken = jwtService.generateRefreshToken(email);
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", createdApplication.getId());
            response.put("calculatedAmount", createdApplication.getCalculatedAmount());
            response.put("email", email);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", Map.of("id", user.getId(), "email", user.getEmail(), "firstName", user.getFirstName(), "lastName", user.getLastName(), "role", user.getRole()));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized Property application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/health")
    public ResponseEntity<?> createUnauthorizedHealthApplication(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String middleName = (String) payload.get("middleName");

            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
            }

            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(email))
                    .firstName(firstName)
                    .lastName(lastName)
                    .middleName(middleName)
                    .role(Role.USER)
                    .build();
            user = userRepository.save(user);

            HealthApplication healthApplication = new HealthApplication();
            if (payload.get("birthDate") != null) healthApplication.setBirthDate(LocalDate.parse(payload.get("birthDate").toString()));
            if (payload.get("passportNumber") != null) healthApplication.setPassportNumber((String) payload.get("passportNumber"));
            if (payload.get("snils") != null) healthApplication.setSnils((String) payload.get("snils"));
            if (payload.get("hasChronicDiseases") != null) healthApplication.setHasChronicDiseases(Boolean.parseBoolean(payload.get("hasChronicDiseases").toString()));
            if (payload.get("chronicDiseasesDetails") != null) healthApplication.setChronicDiseasesDetails((String) payload.get("chronicDiseasesDetails"));
            if (payload.get("hasDisabilities") != null) healthApplication.setHasDisabilities(Boolean.parseBoolean(payload.get("hasDisabilities").toString()));
            if (payload.get("disabilitiesDetails") != null) healthApplication.setDisabilitiesDetails((String) payload.get("disabilitiesDetails"));
            if (payload.get("smokingStatus") != null) healthApplication.setSmokingStatus(Boolean.parseBoolean(payload.get("smokingStatus").toString()));
            if (payload.get("coverDental") != null) healthApplication.setCoverDental(Boolean.parseBoolean(payload.get("coverDental").toString()));
            if (payload.get("coverVision") != null) healthApplication.setCoverVision(Boolean.parseBoolean(payload.get("coverVision").toString()));
            if (payload.get("coverMaternity") != null) healthApplication.setCoverMaternity(Boolean.parseBoolean(payload.get("coverMaternity").toString()));
            if (payload.get("coverEmergency") != null) healthApplication.setCoverEmergency(Boolean.parseBoolean(payload.get("coverEmergency").toString()));
            if (payload.get("preferredClinic") != null) healthApplication.setPreferredClinic((String) payload.get("preferredClinic"));
            if (payload.get("familyDoctorNeeded") != null) healthApplication.setFamilyDoctorNeeded(Boolean.parseBoolean(payload.get("familyDoctorNeeded").toString()));
            // Даты, если они есть в HealthApplication и передаются из payload (кроме birthDate уже добавленного)
            // if (payload.get("startDate") != null) healthApplication.setStartDate(LocalDate.parse(payload.get("startDate").toString()));
            // if (payload.get("endDate") != null) healthApplication.setEndDate(LocalDate.parse(payload.get("endDate").toString()));

            HealthApplication createdApplication = insuranceService.createHealthApplication(healthApplication, email);

            String accessToken = jwtService.generateToken(email);
            String refreshToken = jwtService.generateRefreshToken(email);
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", createdApplication.getId());
            response.put("calculatedAmount", createdApplication.getCalculatedAmount());
            response.put("email", email);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", Map.of("id", user.getId(), "email", user.getEmail(), "firstName", user.getFirstName(), "lastName", user.getLastName(), "role", user.getRole()));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized Health application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unauthorized/travel")
    public ResponseEntity<?> createUnauthorizedTravelApplication(@RequestBody Map<String, Object> payload) {
        try {
            String email = (String) payload.get("email");
            String firstName = (String) payload.get("firstName");
            String lastName = (String) payload.get("lastName");
            String middleName = (String) payload.get("middleName");

            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User with this email already exists"));
            }

            user = User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(email))
                    .firstName(firstName)
                    .lastName(lastName)
                    .middleName(middleName)
                    .role(Role.USER)
                    .build();
            user = userRepository.save(user);

            TravelApplication travelApplication = new TravelApplication();
            if (payload.get("passportNumber") != null) travelApplication.setPassportNumber((String) payload.get("passportNumber"));
            if (payload.get("passportExpiry") != null) travelApplication.setPassportExpiry(LocalDate.parse(payload.get("passportExpiry").toString()));
            if (payload.get("destinationCountry") != null) travelApplication.setDestinationCountry((String) payload.get("destinationCountry"));
            if (payload.get("travelStartDate") != null) travelApplication.setTravelStartDate(LocalDate.parse(payload.get("travelStartDate").toString()));
            if (payload.get("travelEndDate") != null) travelApplication.setTravelEndDate(LocalDate.parse(payload.get("travelEndDate").toString()));
            if (payload.get("purposeOfTrip") != null) travelApplication.setPurposeOfTrip((String) payload.get("purposeOfTrip"));
            if (payload.get("coverMedicalExpenses") != null) travelApplication.setCoverMedicalExpenses(Boolean.parseBoolean(payload.get("coverMedicalExpenses").toString()));
            if (payload.get("coverAccidents") != null) travelApplication.setCoverAccidents(Boolean.parseBoolean(payload.get("coverAccidents").toString()));
            if (payload.get("coverLuggage") != null) travelApplication.setCoverLuggage(Boolean.parseBoolean(payload.get("coverLuggage").toString()));
            if (payload.get("coverTripCancellation") != null) travelApplication.setCoverTripCancellation(Boolean.parseBoolean(payload.get("coverTripCancellation").toString()));
            if (payload.get("coverSportsActivities") != null) travelApplication.setCoverSportsActivities(Boolean.parseBoolean(payload.get("coverSportsActivities").toString()));
            if (payload.get("hasChronicDiseases") != null) travelApplication.setHasChronicDiseases(Boolean.parseBoolean(payload.get("hasChronicDiseases").toString()));
            if (payload.get("plannedSportsActivities") != null) travelApplication.setPlannedSportsActivities((String) payload.get("plannedSportsActivities"));
            // Даты, если они есть в TravelApplication и передаются из payload (кроме уже добавленных дат)
            // if (payload.get("startDate") != null) travelApplication.setStartDate(LocalDate.parse(payload.get("startDate").toString()));
            // if (payload.get("endDate") != null) travelApplication.setEndDate(LocalDate.parse(payload.get("endDate").toString()));

            TravelApplication createdApplication = insuranceService.createTravelApplication(travelApplication, email);

            String accessToken = jwtService.generateToken(email);
            String refreshToken = jwtService.generateRefreshToken(email);
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("id", createdApplication.getId());
            response.put("calculatedAmount", createdApplication.getCalculatedAmount());
            response.put("email", email);
            response.put("accessToken", accessToken);
            response.put("refreshToken", refreshToken);
            response.put("user", Map.of("id", user.getId(), "email", user.getEmail(), "firstName", user.getFirstName(), "lastName", user.getLastName(), "role", user.getRole()));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating unauthorized Travel application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
} 