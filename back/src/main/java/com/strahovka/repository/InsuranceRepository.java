package com.strahovka.repository;

import com.strahovka.entity.Insurance.*;
import com.strahovka.entity.InsurancePolicy;
import com.strahovka.entity.User;
import com.strahovka.enums.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<InsurancePolicy, Long> {

    @Query("SELECT p FROM InsurancePolicy p WHERE p.user.email = :username")
    List<InsurancePolicy> findPoliciesByUsername(@Param("username") String username);

    @Query("SELECT COUNT(p) FROM InsurancePolicy p WHERE p.user = :user AND p.status = :status AND p.active = :active")
    long countByUserAndStatusAndActive(@Param("user") User user, @Param("status") PolicyStatus status, @Param("active") boolean active);

    @Query("SELECT p FROM InsurancePolicy p WHERE p.status = :status")
    List<InsurancePolicy> findPoliciesByStatus(@Param("status") PolicyStatus status);

    @Modifying
    @Query("DELETE FROM InsurancePolicy p WHERE p.id = :id")
    void deletePolicyById(@Param("id") Long id);


    @Query("SELECT g FROM Insurance$InsuranceGuide g")
    List<InsuranceGuide> findAllGuides();

    @Modifying
    @Query("DELETE FROM Insurance$InsuranceGuide g WHERE g.id = :id")
    void deleteGuideById(@Param("id") Long id);


    Optional<InsurancePolicy> findByIdAndUser(Long policyId, User user);
} 