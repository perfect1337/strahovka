package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.dto.KaskoApplicationRequest;
import com.strahovka.repository.KaskoApplicationRepository;
import com.strahovka.repository.UserRepository;
import com.strahovka.repository.InsurancePolicyRepository;
import com.strahovka.repository.InsuranceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KaskoApplicationService {
    private final KaskoApplicationRepository kaskoApplicationRepository;
    private final UserRepository userRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsuranceCategoryRepository categoryRepository;

    @Transactional
    public KaskoApplication createApplication(KaskoApplicationRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create KASKO application
        KaskoApplication application = new KaskoApplication();
        application.setUser(user);
        application.setCarMake(request.getCarMake());
        application.setCarModel(request.getCarModel());
        application.setCarYear(request.getCarYear());
        application.setVinNumber(request.getVinNumber());
        application.setLicensePlate(request.getLicensePlate());
        application.setCarValue(request.getCarValue());
        application.setDriverLicenseNumber(request.getDriverLicenseNumber());
        application.setDriverExperienceYears(request.getDriverExperienceYears());
        application.setHasAntiTheftSystem(request.getHasAntiTheftSystem());
        application.setGarageParking(request.getGarageParking());
        application.setPreviousInsuranceNumber(request.getPreviousInsuranceNumber());
        application.setApplicationDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);
        application.setDuration(request.getDuration());

        // Calculate policy amount based on car value and other factors
        BigDecimal policyAmount = calculatePolicyAmount(request);
        application.setCalculatedAmount(policyAmount);

        // Create and link insurance policy
        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName("КАСКО - " + request.getCarMake() + " " + request.getCarModel());
        policy.setDescription("Страховой полис КАСКО для автомобиля " + request.getCarMake() + " " + request.getCarModel() + 
                            " (" + request.getCarYear() + " г.в., VIN: " + request.getVinNumber() + ")");
        policy.setPrice(policyAmount);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusMonths(request.getDuration())); // Set end date based on duration
        policy.setStatus(PolicyStatus.PENDING_PAYMENT);
        policy.setActive(false);

        // Find and set KASKO category
        InsuranceCategory kaskoCategory = categoryRepository.findByName("КАСКО")
                .orElseThrow(() -> new RuntimeException("KASKO insurance category not found"));
        policy.setCategory(kaskoCategory);

        // Save policy
        policy = policyRepository.save(policy);

        // Link policy to application
        application.setPolicy(policy);

        // Save application
        return kaskoApplicationRepository.save(application);
    }

    @Transactional
    public KaskoApplication processPayment(Long applicationId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        KaskoApplication application = kaskoApplicationRepository.findByIdAndUserId(applicationId, user.getId())
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (application.getStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("Application is not in pending status");
        }

        InsurancePolicy policy = application.getPolicy();
        if (policy == null) {
            throw new RuntimeException("No policy found for this application");
        }

        // Update application status
        application.setStatus(ApplicationStatus.APPROVED);
        application.setProcessedAt(LocalDateTime.now());
        application.setProcessedBy("SYSTEM");

        // Update policy status
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setActive(true);
        policyRepository.save(policy);

        // Increment user's policy count
        user.incrementPolicyCount();
        userRepository.save(user);

        return kaskoApplicationRepository.save(application);
    }

    private BigDecimal calculatePolicyAmount(KaskoApplicationRequest request) {
        // Base rate is 5% of car value
        BigDecimal baseRate = request.getCarValue().multiply(new BigDecimal("0.05"));
        
        // Apply discounts/increases based on factors
        if (request.getHasAntiTheftSystem()) {
            baseRate = baseRate.multiply(new BigDecimal("0.95")); // 5% discount
        }
        if (request.getGarageParking()) {
            baseRate = baseRate.multiply(new BigDecimal("0.95")); // 5% discount
        }
        if (request.getDriverExperienceYears() < 3) {
            baseRate = baseRate.multiply(new BigDecimal("1.2")); // 20% increase
        }
        
        return baseRate.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional(readOnly = true)
    public List<KaskoApplication> getUserApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return kaskoApplicationRepository.findByUserOrderByApplicationDateDesc(user);
    }
} 