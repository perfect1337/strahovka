package com.strahovka.repository;

import com.strahovka.delivery.InsuranceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface InsuranceCategoryRepository extends JpaRepository<InsuranceCategory, Long> {
    Optional<InsuranceCategory> findByName(String name);
} 