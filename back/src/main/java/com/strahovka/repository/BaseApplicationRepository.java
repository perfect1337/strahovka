package com.strahovka.repository;

import com.strahovka.delivery.Insurance.BaseApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.Optional;

@NoRepositoryBean
public interface BaseApplicationRepository<T extends BaseApplication> extends JpaRepository<T, Long> {
    Optional<T> findByIdAndUserId(Long id, Long userId);
} 