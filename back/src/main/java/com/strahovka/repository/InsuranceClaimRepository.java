package com.strahovka.repository;

import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.delivery.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByPolicy(InsurancePolicy policy);
    List<InsuranceClaim> findByStatus(ClaimStatus status);
    List<InsuranceClaim> findByPolicy_User(User user);
} 