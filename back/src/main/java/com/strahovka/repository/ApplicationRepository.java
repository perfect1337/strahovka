package com.strahovka.repository;

import com.strahovka.entity.Insurance.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface  ApplicationRepository extends JpaRepository<BaseApplication, Long> {
    Optional<BaseApplication> findById(Long id);

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

    List<BaseApplication> findByPolicyId(Long policyId);

    void deleteApplicationById(Long id);
} 