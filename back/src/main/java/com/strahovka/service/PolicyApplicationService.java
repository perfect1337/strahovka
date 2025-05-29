package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.entity.ApplicationStatus;
import com.strahovka.repository.PolicyApplicationRepository;
import com.strahovka.repository.InsurancePolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PolicyApplicationService {
    private final PolicyApplicationRepository applicationRepository;
    private final InsurancePolicyRepository policyRepository;

    @Transactional
    public PolicyApplication createApplication(User user, InsurancePackage insurancePackage) {
        PolicyApplication application = new PolicyApplication();
        application.setUser(user);
        application.setInsurancePackage(insurancePackage);
        application.setStatus(ApplicationStatus.APPROVED); // Автоматическое одобрение
        application.setApplicationDate(LocalDateTime.now());
        application.setProcessedAt(LocalDateTime.now());
        application.setProcessedBy("SYSTEM");

        // Создаем новый полис для каждой категории в пакете
        for (InsuranceCategory category : insurancePackage.getCategories()) {
            InsurancePolicy policy = new InsurancePolicy();
            policy.setUser(user);
            policy.setCategory(category);
            policy.setStartDate(LocalDate.now());
            policy.setEndDate(LocalDate.now().plusYears(1)); // Срок действия 1 год
            policy.setActive(true);
            policy.setStatus(PolicyStatus.ACTIVE);
            policy.setName(category.getName());
            policy.setDescription(category.getDescription());
            policy.setPrice(category.getBasePrice());

            policyRepository.save(policy);
        }

        return applicationRepository.save(application);
    }

    public List<PolicyApplication> getUserApplications(User user) {
        return applicationRepository.findByUser(user);
    }

    public List<PolicyApplication> getAllApplications() {
        return applicationRepository.findAll();
    }
} 