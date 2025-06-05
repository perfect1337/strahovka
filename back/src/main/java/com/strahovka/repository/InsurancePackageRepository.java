package com.strahovka.repository;

import com.strahovka.entity.Insurance.InsurancePackage;
import com.strahovka.enums.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsurancePackageRepository extends JpaRepository<InsurancePackage, Long> {

    @Query("SELECT DISTINCT p FROM InsurancePackageEntity p LEFT JOIN FETCH p.categories WHERE p.user.email = :email")
    List<InsurancePackage> findByUserEmail(@Param("email") String email);

    @Query("SELECT DISTINCT p FROM InsurancePackageEntity p LEFT JOIN FETCH p.categories WHERE p.status = :status")
    List<InsurancePackage> findByStatus(@Param("status") PackageStatus status);

    @Query("SELECT DISTINCT p FROM InsurancePackageEntity p LEFT JOIN FETCH p.categories WHERE p.active = true")
    List<InsurancePackage> findByActiveTrue();

    @Query("SELECT DISTINCT p FROM InsurancePackageEntity p LEFT JOIN FETCH p.categories")
    List<InsurancePackage> findAllWithCategories();

    @Override
    @Query("SELECT DISTINCT p FROM InsurancePackageEntity p LEFT JOIN FETCH p.categories WHERE p.id = :id")
    java.util.Optional<InsurancePackage> findById(@Param("id") Long id);


} 