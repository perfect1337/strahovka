package com.strahovka.service;

import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.PolicyStatus;
import com.strahovka.delivery.User;
import com.strahovka.delivery.InsuranceCategory;
import com.strahovka.dto.CreatePolicyRequest;
import com.strahovka.repository.InsurancePolicyRepository;
import com.strahovka.repository.UserRepository;
import com.strahovka.repository.InsuranceCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InsurancePolicyService {

    @Autowired
    private InsurancePolicyRepository insurancePolicyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InsuranceCategoryRepository categoryRepository;

    @Transactional
    public InsurancePolicy createPolicy(CreatePolicyRequest request, User user) {
        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setCategory(request.getCategory());
        policy.setStartDate(request.getStartDate());
        policy.setEndDate(request.getEndDate());
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setPrice(request.getPrice());
        policy.setDetails(request.getDetails());
        policy.calculateCashback();

        // Update user's policy count and level
        user.incrementPolicyCount();
        userRepository.save(user);

        return insurancePolicyRepository.save(policy);
    }

    @Transactional
    public void cancelPolicy(Long policyId, User user) {
        InsurancePolicy policy = insurancePolicyRepository.findById(policyId)
            .orElseThrow(() -> new RuntimeException("Страховой полис не найден"));

        if (!policy.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("У вас нет прав на отмену данного полиса");
        }

        policy.setStatus(PolicyStatus.CANCELLED);
        insurancePolicyRepository.save(policy);

        // Update user's policy count and level
        user.decrementPolicyCount();
        userRepository.save(user);
    }
} 