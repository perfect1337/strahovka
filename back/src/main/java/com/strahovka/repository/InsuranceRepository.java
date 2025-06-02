package com.strahovka.repository;

import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.entity.PolicyStatus;
import com.strahovka.entity.PackageStatus;
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
    List<InsurancePolicy> findByStatus(@Param("status") PolicyStatus status);

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

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO insurance_guides (title, description, insurance_type, important_notes, required_documents, coverage_details, calculation_rules, active, display_order, created_at, updated_at) " +
           "VALUES (:#{#guide.title}, :#{#guide.description}, :#{#guide.insuranceType}, :#{#guide.importantNotes}, " +
           ":#{#guide.requiredDocuments}, :#{#guide.coverageDetails}, :#{#guide.calculationRules}, :#{#guide.active}, " +
           ":#{#guide.displayOrder}, :#{#guide.createdAt}, :#{#guide.updatedAt}) RETURNING *", nativeQuery = true)
    InsuranceGuide saveGuide(@Param("guide") InsuranceGuide guide);

    // Package operations
    @Query("SELECT p FROM Insurance$InsurancePackage p WHERE p.user.email = :email")
    List<InsurancePackage> findPackagesByUsername(@Param("email") String email);

    @Query("SELECT p FROM Insurance$InsurancePackage p WHERE p.status = :status")
    List<InsurancePackage> findPackagesByStatus(@Param("status") PackageStatus status);

    @Query("SELECT p FROM Insurance$InsurancePackage p WHERE p.active = true")
    List<InsurancePackage> findByActiveTrue();

    @Query("SELECT p FROM Insurance$InsurancePackage p")
    List<InsurancePackage> findAllPackages();

    @Modifying
    @Query("INSERT INTO Insurance$InsurancePackage (name, description, basePrice, discount, active, user, status) " +
           "VALUES (:#{#package.name}, :#{#package.description}, :#{#package.basePrice}, " +
           ":#{#package.discount}, :#{#package.active}, :#{#package.user}, :#{#package.status})")
    InsurancePackage savePackage(@Param("package") InsurancePackage insurancePackage);

    @Modifying
    @Query("UPDATE Insurance$InsurancePackage p SET " +
           "p.name = :#{#package.name}, " +
           "p.description = :#{#package.description}, " +
           "p.basePrice = :#{#package.basePrice}, " +
           "p.discount = :#{#package.discount}, " +
           "p.active = :#{#package.active}, " +
           "p.status = :#{#package.status} " +
           "WHERE p.id = :#{#package.id}")
    void updatePackage(@Param("package") InsurancePackage insurancePackage);

    @Modifying
    @Query("DELETE FROM Insurance$InsurancePackage p WHERE p.id = :id")
    void deletePackageById(@Param("id") Long id);

    // Category operations
    @Query("SELECT c FROM Insurance$InsuranceCategory c")
    List<InsuranceCategory> findAllCategories();

    @Modifying
    @Query("INSERT INTO Insurance$InsuranceCategory (name, description, basePrice, type) " +
           "VALUES (:#{#category.name}, :#{#category.description}, :#{#category.basePrice}, :#{#category.type})")
    void saveCategory(@Param("category") InsuranceCategory category);

    @Modifying
    @Query("DELETE FROM Insurance$InsuranceCategory c WHERE c.id = :id")
    void deleteCategoryById(@Param("id") Long id);

    @Query("SELECT c FROM Insurance$InsuranceCategory c WHERE c.name = :name")
    InsuranceCategory findCategoryByName(@Param("name") String name);

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