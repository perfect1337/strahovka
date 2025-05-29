package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;
import java.time.temporal.ChronoUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class InsuranceService {
    private final InsuranceCategoryRepository categoryRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsuranceClaimRepository claimRepository;
    private final InsurancePackageRepository packageRepository;
    private final InsuranceApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final InsuranceGuideRepository guideRepository;

    public List<InsuranceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<InsurancePackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public List<InsurancePackage> getAllActivePackages() {
        return packageRepository.findByActiveTrue();
    }

    @Transactional
    public InsuranceApplication createApplication(InsuranceApplication application) {
        // Проверяем существование пользователя
        User user = userRepository.findById(application.getUser().getId())
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        
        // Если указан пакет, проверяем его существование и активность
        if (application.getPackageId() != null) {
            InsurancePackage insurancePackage = packageRepository.findById(application.getPackageId())
                .orElseThrow(() -> new RuntimeException("Страховой пакет не найден"));
            
            if (!insurancePackage.isActive()) {
                throw new RuntimeException("Данный страховой пакет больше не доступен");
            }
        }

        // Устанавливаем статус PENDING для новой заявки
        application.setStatus("PENDING");
        
        return applicationRepository.save(application);
    }

    public List<InsuranceApplication> getUserApplications(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return applicationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public InsuranceApplication getApplicationById(Long id) {
        return applicationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Заявка не найдена"));
    }

    @Transactional
    public InsuranceApplication updateApplicationStatus(Long id, String status) {
        InsuranceApplication application = getApplicationById(id);
        application.setStatus(status);
        return applicationRepository.save(application);
    }

    @Transactional
    public InsurancePolicy createPolicy(Long userId, Long categoryId, LocalDate endDate, String details) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        InsuranceCategory category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Категория не найдена"));

        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setCategory(category);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(endDate);
        policy.setStatus(PolicyStatus.PENDING_PAYMENT);
        policy.setDetails(details);
        policy.setPrice(category.getBasePrice());
        policy.calculateCashback();

        // Link the corresponding insurance guide
        guideRepository.findByInsuranceType(category.getType())
            .ifPresent(policy::setGuide);

        // Don't increment policy count until payment is successful
        return policyRepository.save(policy);
    }

    @Transactional
    public List<InsurancePolicy> createPackagePolicies(Long userId, Long packageId, LocalDate endDate, String details) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        InsurancePackage insurancePackage = packageRepository.findById(packageId)
            .orElseThrow(() -> new RuntimeException("Страховой пакет не найден"));

        if (!insurancePackage.isActive()) {
            throw new RuntimeException("Данный страховой пакет больше не доступен");
        }

        List<InsurancePolicy> policies = insurancePackage.getCategories().stream()
            .map(category -> {
                InsurancePolicy policy = new InsurancePolicy();
                policy.setUser(user);
                policy.setCategory(category);
                policy.setStartDate(LocalDate.now());
                policy.setEndDate(endDate);
                policy.setStatus(PolicyStatus.PENDING_PAYMENT);
                policy.setDetails(details);
                
                // Calculate price with discount
                BigDecimal finalPrice = calculatePriceWithDiscount(
                    category.getBasePrice(),
                    insurancePackage.getDiscount()
                );
                policy.setPrice(finalPrice);
                policy.calculateCashback();

                // Link the corresponding insurance guide
                guideRepository.findByInsuranceType(category.getType())
                    .ifPresent(policy::setGuide);
                
                return policy;
            })
            .collect(Collectors.toList());

        // Don't increment policy count until payment is successful
        return policyRepository.saveAll(policies);
    }

    private BigDecimal calculatePriceWithDiscount(BigDecimal basePrice, int discountPercent) {
        if (discountPercent <= 0) {
            return basePrice;
        }
        BigDecimal discount = basePrice.multiply(BigDecimal.valueOf(discountPercent))
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return basePrice.subtract(discount);
    }

    public List<InsurancePolicy> getUserPolicies(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return policyRepository.findByUserOrderByStartDateDesc(user);
    }

    @Transactional
    public InsurancePolicy suspendPolicy(Long policyId) {
        InsurancePolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Страховой полис не найден"));
        
        policy.setStatus(PolicyStatus.INACTIVE);
        policy.setActive(false);
        policy.setEndDate(LocalDate.now());
        
        // Update user's policy count and level when cancelling
        User user = policy.getUser();
        user.decrementPolicyCount();
        userRepository.save(user);
        
        return policyRepository.save(policy);
    }

    @Transactional
    public InsuranceClaim createClaim(Long policyId, String description) {
        InsurancePolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Страховой полис не найден"));

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new RuntimeException("Нельзя создать страховой случай для неактивного полиса");
        }

        InsuranceClaim claim = new InsuranceClaim();
        claim.setPolicy(policy);
        claim.setClaimDate(LocalDate.now());
        claim.setDescription(description);
        claim.setStatus(ClaimStatus.PENDING);

        return claimRepository.save(claim);
    }

    public List<InsuranceClaim> getUserClaims(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return claimRepository.findByPolicy_User(user);
    }

    @Transactional
    public InsuranceClaim processClaim(Long claimId, String response, ClaimStatus status, BigDecimal calculatedAmount) {
        InsuranceClaim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Страховой случай не найден"));
        
        claim.setResponse(response);
        claim.setStatus(status);
        claim.setResponseDate(LocalDate.now());
        claim.setCalculatedAmount(calculatedAmount);
        
        return claimRepository.save(claim);
    }

    public List<InsuranceClaim> getPendingClaims() {
        return claimRepository.findByStatus(ClaimStatus.PENDING);
    }

    @Transactional
    public InsurancePolicy processPayment(Long policyId, User user) {
        InsurancePolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (!policy.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to policy");
        }

        if (policy.getStatus() != PolicyStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Policy is not in pending payment status");
        }

        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setActive(true);
        
        // Increment user's policy count after successful payment
        user.incrementPolicyCount();
        userRepository.save(user);

        return policyRepository.save(policy);
    }

    @Transactional
    public Map<String, Object> cancelPolicy(Long policyId, String reason) {
        InsurancePolicy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("Страховой полис не найден"));

        log.debug("Attempting to cancel policy with ID: {}, current status: {}", policyId, policy.getStatus());

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            String errorMsg = String.format(
                "Полис не может быть отменен. Текущий статус: %s. Разрешенный статус: ACTIVE",
                policy.getStatus()
            );
            log.error(errorMsg);
            throw new RuntimeException(errorMsg);
        }

        // Validate policy expiration
        LocalDate today = LocalDate.now();
        if (today.isAfter(policy.getEndDate())) {
            String errorMsg = String.format(
                "Полис уже истек и не может быть отменен. Дата окончания: %s",
                policy.getEndDate()
            );
            log.error(errorMsg);
            throw new RuntimeException(errorMsg);
        }

        // Calculate days
        long totalDays = ChronoUnit.DAYS.between(policy.getStartDate(), policy.getEndDate());
        long remainingDays = ChronoUnit.DAYS.between(today, policy.getEndDate());
        long usedDays = totalDays - remainingDays;
        long daysFromStart = ChronoUnit.DAYS.between(policy.getStartDate(), today);

        log.debug("Policy cancellation calculation - Total days: {}, Remaining days: {}, Used days: {}, Days from start: {}", 
                 totalDays, remainingDays, usedDays, daysFromStart);

        // Calculate refund amount
        BigDecimal refundAmount;
        String refundMessage;
        
        if (daysFromStart <= 14) {
            // Full refund within cooling period
            refundAmount = policy.getPrice();
            refundMessage = "Полис отменен в период охлаждения (14 дней). Возврат 100% стоимости.";
            log.debug("Policy cancelled within cooling period - Full refund: {}", refundAmount);
        } else {
            // Proportional refund with administrative fee
            BigDecimal usedPortion = BigDecimal.valueOf(usedDays)
                    .divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
            BigDecimal unusedAmount = policy.getPrice()
                    .multiply(BigDecimal.ONE.subtract(usedPortion));
            
            // Apply 20% administrative fee
            BigDecimal adminFee = unusedAmount.multiply(new BigDecimal("0.20"));
            refundAmount = unusedAmount.subtract(adminFee);
            refundMessage = String.format(
                "Полис отменен после периода охлаждения. Возврат пропорционально неиспользованному периоду минус 20%% (административные расходы)."
            );
            log.debug("Policy cancelled after cooling period - Used portion: {}, Unused amount: {}, Admin fee: {}, Final refund: {}", 
                     usedPortion, unusedAmount, adminFee, refundAmount);
        }

        // Update policy
        policy.setStatus(PolicyStatus.CANCELLED);
        policy.setActive(false);
        policy.setCancelledAt(LocalDateTime.now());
        policy.setCancellationReason(reason);
        policy.setRefundAmount(refundAmount.setScale(2, RoundingMode.HALF_UP));

        // Update user's policy count
        User user = policy.getUser();
        user.decrementPolicyCount();
        userRepository.save(user);

        // Save updated policy
        policy = policyRepository.save(policy);
        log.info("Successfully cancelled policy ID: {}. Refund amount: {}", policyId, refundAmount);

        // Return response with policy and refund details
        Map<String, Object> response = new HashMap<>();
        response.put("policy", policy);
        response.put("refundAmount", refundAmount);
        response.put("message", String.format("Полис успешно отменен. %s Сумма возврата: %.2f ₽", refundMessage, refundAmount));

        return response;
    }
} 