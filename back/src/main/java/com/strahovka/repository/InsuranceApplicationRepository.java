package com.strahovka.repository;

import com.strahovka.delivery.InsuranceApplication;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InsuranceApplicationRepository extends JpaRepository<InsuranceApplication, Long> {
    List<InsuranceApplication> findByUserOrderByCreatedAtDesc(User user);
} 