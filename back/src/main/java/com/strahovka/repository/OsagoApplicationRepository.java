package com.strahovka.repository;

import com.strahovka.delivery.OsagoApplication;
import com.strahovka.delivery.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OsagoApplicationRepository extends JpaRepository<OsagoApplication, Long> {
    List<OsagoApplication> findByUser(User user);
    List<OsagoApplication> findByUserOrderByApplicationDateDesc(User user);
} 