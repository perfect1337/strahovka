package com.strahovka.repository;

import com.strahovka.delivery.PropertyApplication;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropertyApplicationRepository extends JpaRepository<PropertyApplication, Long> {
    List<PropertyApplication> findByUser(User user);
    List<PropertyApplication> findByUserOrderByApplicationDateDesc(User user);
} 