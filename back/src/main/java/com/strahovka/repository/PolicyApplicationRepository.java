package com.strahovka.repository;

import com.strahovka.delivery.PolicyApplication;
import com.strahovka.entity.ApplicationStatus;
import com.strahovka.delivery.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyApplicationRepository extends JpaRepository<PolicyApplication, Long> {
    Page<PolicyApplication> findByStatus(ApplicationStatus status, Pageable pageable);
    Page<PolicyApplication> findAll(Pageable pageable);
    List<PolicyApplication> findByUser(User user);
    List<PolicyApplication> findByUserOrderByApplicationDateDesc(User user);
} 