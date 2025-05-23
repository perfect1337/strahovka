package com.strahovka.repository;

import com.strahovka.delivery.KaskoApplication;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KaskoApplicationRepository extends JpaRepository<KaskoApplication, Long> {
    List<KaskoApplication> findByUserOrderByApplicationDateDesc(User user);
    List<KaskoApplication> findByUserId(Long userId);
    Optional<KaskoApplication> findByIdAndUserId(Long id, Long userId);
} 