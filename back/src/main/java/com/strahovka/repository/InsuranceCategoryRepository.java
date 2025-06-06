package com.strahovka.repository;

import com.strahovka.entity.Insurance.InsuranceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InsuranceCategoryRepository extends JpaRepository<InsuranceCategory, Long> {
    Optional<InsuranceCategory> findByName(String name);
    Optional<InsuranceCategory> findByNameAndType(String name, String type);
} 