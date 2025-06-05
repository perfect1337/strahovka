package com.strahovka.repository;

import com.strahovka.delivery.PackageApplicationLink;
import com.strahovka.delivery.PackageApplicationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface PackageApplicationLinkRepository extends JpaRepository<PackageApplicationLink, PackageApplicationId> {
    List<PackageApplicationLink> findByPackageId(Long packageId);
    Optional<PackageApplicationLink> findByApplicationIdAndApplicationType(Long applicationId, String applicationType);
    List<PackageApplicationLink> findByInsurancePackage_User_Email(String email);
} 