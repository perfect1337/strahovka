package com.strahovka.repository;

import com.strahovka.delivery.TravelApplication;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TravelApplicationRepository extends JpaRepository<TravelApplication, Long> {
    List<TravelApplication> findByUser(User user);
    List<TravelApplication> findByUserOrderByApplicationDateDesc(User user);
} 