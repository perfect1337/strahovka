package com.strahovka.repository;

import com.strahovka.entity.PackageApplicationLink;
import com.strahovka.entity.PackageApplicationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PackageApplicationLinkRepository extends JpaRepository<PackageApplicationLink, PackageApplicationId> {
    Optional<PackageApplicationLink> findByApplicationIdAndApplicationType(Long applicationId, String applicationType);
} 