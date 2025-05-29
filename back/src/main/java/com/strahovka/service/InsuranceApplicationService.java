package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.entity.ApplicationStatus;
import com.strahovka.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsuranceApplicationService {
    private final KaskoApplicationRepository kaskoRepository;
    private final OsagoApplicationRepository osagoRepository;
    private final TravelApplicationRepository travelRepository;
    private final HealthApplicationRepository healthRepository;
    private final PropertyApplicationRepository propertyRepository;
    private final UserRepository userRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsuranceCategoryRepository categoryRepository;

    @Transactional
    public KaskoApplication createKaskoApplication(KaskoApplication application, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateKaskoApplication(application);

        application.setUser(user);
        application.setApplicationDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);

        return kaskoRepository.save(application);
    }

    private void validateKaskoApplication(KaskoApplication application) {
        if (application.getCarMake() == null || application.getCarMake().trim().isEmpty()) {
            throw new IllegalArgumentException("Car make is required");
        }
        if (application.getCarModel() == null || application.getCarModel().trim().isEmpty()) {
            throw new IllegalArgumentException("Car model is required");
        }
        if (application.getCarYear() == null || application.getCarYear() < 1900 || 
            application.getCarYear() > LocalDateTime.now().getYear() + 1) {
            throw new IllegalArgumentException("Invalid car year");
        }
        if (application.getVinNumber() == null || application.getVinNumber().trim().isEmpty() || 
            application.getVinNumber().length() != 17) {
            throw new IllegalArgumentException("Valid 17-character VIN number is required");
        }
        if (application.getDriverLicenseNumber() == null || application.getDriverLicenseNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Driver's license number is required");
        }
    }

    @Transactional
    public OsagoApplication createOsagoApplication(OsagoApplication application) {
        log.info("Creating OSAGO application for user: {}", application.getUser().getEmail());
        
        // Set initial application state
        application.setApplicationDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);

        // Calculate policy amount based on factors
        BigDecimal baseRate = calculateOsagoPolicyAmount(application);
        application.setCalculatedAmount(baseRate);
        log.info("Calculated base rate: {}", baseRate);

        // Create and link insurance policy
        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(application.getUser());
        policy.setName("ОСАГО - " + application.getCarMake() + " " + application.getCarModel());
        policy.setDescription("Страховой полис ОСАГО для автомобиля " + application.getCarMake() + " " + application.getCarModel() + 
                            " (" + application.getCarYear() + " г.в., VIN: " + application.getVinNumber() + ")");
        policy.setPrice(baseRate);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusMonths(12)); // OSAGO is always for 1 year
        policy.setStatus(PolicyStatus.PENDING_PAYMENT);
        policy.setActive(false);

        // Find and set OSAGO category
        InsuranceCategory osagoCategory = categoryRepository.findByName("ОСАГО")
                .orElseThrow(() -> new RuntimeException("OSAGO insurance category not found"));
        policy.setCategory(osagoCategory);
        log.info("Found OSAGO category: {}", osagoCategory.getName());

        // Save policy first and flush to ensure it's in the database
        policy = policyRepository.saveAndFlush(policy);
        log.info("Saved policy with ID: {}", policy.getId());

        // Link policy to application
        application.setPolicy(policy);
        log.info("Linked policy {} to application", policy.getId());

        // Save application with linked policy and flush to ensure all changes are persisted
        OsagoApplication savedApplication = osagoRepository.saveAndFlush(application);
        log.info("Saved application with ID: {} and linked policy ID: {}", 
                savedApplication.getId(), savedApplication.getPolicy() != null ? savedApplication.getPolicy().getId() : "null");

        // Clear persistence context to ensure fresh data
        osagoRepository.flush();
        policyRepository.flush();

        // Verify the policy link with a fresh query
        OsagoApplication verifiedApplication = osagoRepository.findById(savedApplication.getId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve saved application"));
        if (verifiedApplication.getPolicy() == null) {
            log.error("Policy link verification failed for application ID: {}", verifiedApplication.getId());
            throw new RuntimeException("Failed to link policy to application");
        }
        log.info("Verified policy link for application ID: {}", verifiedApplication.getId());

        return verifiedApplication;
    }

    private BigDecimal calculateOsagoPolicyAmount(OsagoApplication application) {
        // Base rate depends on engine power
        BigDecimal baseRate;
        if (application.getEnginePower() <= 50) {
            baseRate = new BigDecimal("1500");
        } else if (application.getEnginePower() <= 100) {
            baseRate = new BigDecimal("2500");
        } else if (application.getEnginePower() <= 150) {
            baseRate = new BigDecimal("3500");
        } else {
            baseRate = new BigDecimal("4500");
        }

        // Apply multipliers based on factors
        if (application.getDriverExperienceYears() < 3) {
            baseRate = baseRate.multiply(new BigDecimal("1.2")); // 20% increase for inexperienced drivers
        }
        if (Boolean.TRUE.equals(application.getHasAccidentsLastYear())) {
            baseRate = baseRate.multiply(new BigDecimal("1.5")); // 50% increase for accidents
        }

        return baseRate.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public TravelApplication createTravelApplication(TravelApplication application) {
        return travelRepository.save(application);
    }

    @Transactional
    public HealthApplication createHealthApplication(HealthApplication application) {
        return healthRepository.save(application);
    }

    @Transactional
    public PropertyApplication createPropertyApplication(PropertyApplication application) {
        return propertyRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<KaskoApplication> getKaskoApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return kaskoRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public KaskoApplication getKaskoApplication(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return kaskoRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<OsagoApplication> getUserOsagoApplications(User user) {
        return osagoRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<TravelApplication> getUserTravelApplications(User user) {
        return travelRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<HealthApplication> getUserHealthApplications(User user) {
        return healthRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<PropertyApplication> getUserPropertyApplications(User user) {
        return propertyRepository.findByUserOrderByApplicationDateDesc(user);
    }

    @Transactional
    public OsagoApplication processOsagoPayment(Long applicationId, String userEmail) {
        log.info("Processing OSAGO payment for application ID: {} and user: {}", applicationId, userEmail);
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Clear persistence context before loading application
        osagoRepository.flush();
        policyRepository.flush();

        OsagoApplication application = osagoRepository.findByIdAndUserId(applicationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Application not found"));
        log.info("Found application with status: {}", application.getStatus());

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application is not in pending status");
        }

        InsurancePolicy policy = application.getPolicy();
        if (policy == null) {
            log.error("No policy found for application ID: {}", applicationId);
            throw new RuntimeException("No policy found for this application");
        }
        log.info("Found policy with ID: {} and status: {}", policy.getId(), policy.getStatus());

        // Update application status to PAID
        application.setStatus(ApplicationStatus.PAID);
        application.setProcessedAt(LocalDateTime.now());
        application.setProcessedBy("SYSTEM");

        // Update policy status
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setActive(true);
        policy = policyRepository.saveAndFlush(policy);
        log.info("Updated policy status to ACTIVE");

        // Increment user's policy count
        user.incrementPolicyCount();
        user = userRepository.saveAndFlush(user);
        log.info("Incremented user's policy count");

        // Save application with updated policy and flush changes
        OsagoApplication savedApplication = osagoRepository.saveAndFlush(application);
        log.info("Saved application with status: {} and policy ID: {}", 
                savedApplication.getStatus(), savedApplication.getPolicy().getId());

        // Clear persistence context to ensure fresh data
        osagoRepository.flush();
        policyRepository.flush();
        userRepository.flush();

        // Verify the changes with a fresh query
        OsagoApplication verifiedApplication = osagoRepository.findById(savedApplication.getId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve saved application"));
        if (verifiedApplication.getPolicy() == null || verifiedApplication.getPolicy().getStatus() != PolicyStatus.ACTIVE) {
            log.error("Policy status verification failed for application ID: {}", verifiedApplication.getId());
            throw new RuntimeException("Failed to update policy status");
        }
        log.info("Verified policy status for application ID: {}", verifiedApplication.getId());

        return verifiedApplication;
    }

    public List<BaseApplication> getAllUserApplications(User user) {
        List<BaseApplication> allApplications = new ArrayList<>();
        allApplications.addAll(kaskoRepository.findByUserId(user.getId()));
        allApplications.addAll(getUserOsagoApplications(user));
        allApplications.addAll(getUserTravelApplications(user));
        allApplications.addAll(getUserHealthApplications(user));
        allApplications.addAll(getUserPropertyApplications(user));
        return allApplications;
    }
} 