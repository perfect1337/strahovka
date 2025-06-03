package com.strahovka.repository;

import com.strahovka.delivery.Insurance.InsurancePackage;
import com.strahovka.enums.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    // This custom update might be useful for partial updates not touching relationships.
    // However, for general updates, fetching the entity, modifying, and then calling save() is preferred.
    @Modifying
    @Query("UPDATE InsurancePackageEntity p SET " +
           "p.name = :#{#package.name}, " +
           "p.description = :#{#package.description}, " +
           "p.basePrice = :#{#package.basePrice}, " +
           "p.discount = :#{#package.discount}, " +
           "p.active = :#{#package.active}, " +
           "p.status = :#{#package.status} " +
           "WHERE p.id = :#{#package.id}")
    int updatePackageDetails(@Param("package") InsurancePackage insurancePackage);
} 