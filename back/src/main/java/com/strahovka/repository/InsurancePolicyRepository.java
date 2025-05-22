package com.strahovka.repository;

import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsurancePolicyRepository extends JpaRepository<InsurancePolicy, Long> {
    List<InsurancePolicy> findByActiveTrue();
    List<InsurancePolicy> findByUserOrderByStartDateDesc(User user);
} 