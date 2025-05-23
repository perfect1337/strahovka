package com.strahovka.repository;

import com.strahovka.delivery.InsurancePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InsurancePackageRepository extends JpaRepository<InsurancePackage, Long> {
    List<InsurancePackage> findByActiveTrue();
} 