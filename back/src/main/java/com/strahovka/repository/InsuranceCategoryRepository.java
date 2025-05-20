package com.strahovka.repository;

import com.strahovka.delivery.InsuranceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InsuranceCategoryRepository extends JpaRepository<InsuranceCategory, Long> {
} 