package com.strahovka.repository;

import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.enums.PolicyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<InsurancePolicy, Long> {
    // Policy operations
    @Query("SELECT p FROM InsurancePolicy p WHERE p.user.email = :email")
    List<InsurancePolicy> findPoliciesByUsername(@Param("email") String email);

    @Query("SELECT p FROM InsurancePolicy p WHERE p.status = :status")
    List<InsurancePolicy> findPoliciesByStatus(@Param("status") PolicyStatus status);

    @Modifying
    @Query("DELETE FROM InsurancePolicy p WHERE p.id = :id")
    void deletePolicyById(@Param("id") Long id);

    // Guide operations
    @Query("SELECT g FROM Insurance$InsuranceGuide g")
    List<InsuranceGuide> findAllGuides();

    @Query("SELECT g FROM Insurance$InsuranceGuide g WHERE g.active = true")
    List<InsuranceGuide> findActiveGuides();

    @Query("SELECT g FROM Insurance$InsuranceGuide g WHERE g.insuranceType = :type")
    List<InsuranceGuide> findGuidesByType(@Param("type") String type);

    @Modifying
    @Query("DELETE FROM Insurance$InsuranceGuide g WHERE g.id = :id")
    void deleteGuideById(@Param("id") Long id);

    // Application operations
    @Query("SELECT a FROM Insurance$KaskoApplication a WHERE a.user.email = :email")
    List<KaskoApplication> findKaskoApplicationsByUsername(@Param("email") String email);

    @Query("SELECT a FROM Insurance$OsagoApplication a WHERE a.user.email = :email")
    List<OsagoApplication> findOsagoApplicationsByUsername(@Param("email") String email);

    @Query("SELECT a FROM Insurance$PropertyApplication a WHERE a.user.email = :email")
    List<PropertyApplication> findPropertyApplicationsByUsername(@Param("email") String email);

    @Query("SELECT a FROM Insurance$HealthApplication a WHERE a.user.email = :email")
    List<HealthApplication> findHealthApplicationsByUsername(@Param("email") String email);

    @Query("SELECT a FROM Insurance$TravelApplication a WHERE a.user.email = :email")
    List<TravelApplication> findTravelApplicationsByUsername(@Param("email") String email);

    @Modifying
    @Query("DELETE FROM Insurance$BaseApplication a WHERE a.id = :id")
    void deleteApplicationById(@Param("id") Long id);

    Optional<InsurancePolicy> findByIdAndUser(Long policyId, User user);
} 