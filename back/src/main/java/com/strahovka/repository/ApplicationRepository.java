package com.strahovka.repository;

import com.strahovka.delivery.Insurance.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<BaseApplication, Long> {
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

    void deleteApplicationById(Long id);
} 