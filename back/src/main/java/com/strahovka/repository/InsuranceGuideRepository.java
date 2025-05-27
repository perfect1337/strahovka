package com.strahovka.repository;

import com.strahovka.delivery.InsuranceGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceGuideRepository extends JpaRepository<InsuranceGuide, Long> {
    List<InsuranceGuide> findByActiveOrderByDisplayOrderAsc(boolean active);
    Optional<InsuranceGuide> findByInsuranceType(String insuranceType);
    List<InsuranceGuide> findAllByOrderByDisplayOrderAsc();
} 