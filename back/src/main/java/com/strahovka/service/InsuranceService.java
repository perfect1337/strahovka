package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setDetails(details);
        policy.setPrice(category.getBasePrice());
        policy.calculateCashback();

        // Update user's policy count and level
        user.incrementPolicyCount();
        userRepository.save(user);

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
                policy.setStatus(PolicyStatus.ACTIVE);
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

        // Update user's policy count and level
        user.incrementPolicyCount();
        userRepository.save(user);

        return policyRepository.saveAll(policies);
    }

    private BigDecimal calculatePriceWithDiscount(BigDecimal basePrice, int discountPercent) {
        if (discountPercent <= 0) {
            return basePrice;
        }
        BigDecimal discount = basePrice.multiply(BigDecimal.valueOf(discountPercent))
            .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);
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
        
        policy.setStatus(PolicyStatus.CANCELLED);
        
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
} 