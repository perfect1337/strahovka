package com.strahovka.repository;

import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.delivery.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByPolicy(InsurancePolicy policy);
    List<InsuranceClaim> findByStatus(ClaimStatus status);
    List<InsuranceClaim> findByPolicy_User(User user);
    Page<InsuranceClaim> findByStatus(ClaimStatus status, Pageable pageable);
    Page<InsuranceClaim> findAll(Pageable pageable);
} 