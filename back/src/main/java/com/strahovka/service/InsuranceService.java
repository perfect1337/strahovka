package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.repository.*;
import lombok.RequiredArgsConstructor;
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

@Service
@RequiredArgsConstructor
public class InsuranceService {
    private final InsuranceCategoryRepository categoryRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsuranceClaimRepository claimRepository;
    private final InsurancePackageRepository packageRepository;
    private final UserRepository userRepository;

    public List<InsuranceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<InsurancePackage> getAllPackages() {
        return packageRepository.findAll();
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
        
        // Increment user's policy count after successful payment
        user.incrementPolicyCount();
        userRepository.save(user);

        return policyRepository.save(policy);
    }

    @Transactional
    public Map<String, Object> cancelPolicy(Long policyId) {
        InsurancePolicy policy = policyRepository.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Страховой полис не найден"));
        
        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new RuntimeException("Можно остановить только активный полис");
        }

        // Рассчитываем сумму возврата
        BigDecimal refundAmount = calculateRefundAmount(policy);
        
        // Обновляем статус полиса
        policy.setStatus(PolicyStatus.INACTIVE);
        policy.setActive(false);
        policy.setEndDate(LocalDate.now());
        
        // Обновляем количество полисов пользователя
        User user = policy.getUser();
        user.decrementPolicyCount();
        userRepository.save(user);
        
        // Сохраняем изменения полиса
        policyRepository.save(policy);
        
        // Возвращаем информацию о возврате
        Map<String, Object> result = new HashMap<>();
        result.put("policy", policy);
        result.put("refundAmount", refundAmount);
        return result;
    }

    private BigDecimal calculateRefundAmount(InsurancePolicy policy) {
        // Получаем общую длительность полиса в днях
        long totalDays = ChronoUnit.DAYS.between(policy.getStartDate(), policy.getEndDate());
        // Получаем количество оставшихся дней
        long remainingDays = ChronoUnit.DAYS.between(LocalDate.now(), policy.getEndDate());
        
        // Если срок полиса уже истек
        if (remainingDays <= 0) {
            return BigDecimal.ZERO;
        }
        
        // Рассчитываем процент возврата
        BigDecimal refundPercentage = BigDecimal.valueOf(remainingDays)
            .divide(BigDecimal.valueOf(totalDays), 4, RoundingMode.HALF_UP);
        
        // Рассчитываем сумму возврата
        return policy.getPrice()
            .multiply(refundPercentage)
            .setScale(2, RoundingMode.HALF_UP);
    }
} 