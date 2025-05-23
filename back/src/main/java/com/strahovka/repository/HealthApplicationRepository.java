package com.strahovka.repository;

import com.strahovka.delivery.HealthApplication;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HealthApplicationRepository extends JpaRepository<HealthApplication, Long> {
    List<HealthApplication> findByUser(User user);
    List<HealthApplication> findByUserOrderByApplicationDateDesc(User user);
} 