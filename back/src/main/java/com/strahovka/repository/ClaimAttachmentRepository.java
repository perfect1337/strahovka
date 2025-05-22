package com.strahovka.repository;

import com.strahovka.delivery.ClaimAttachment;
import com.strahovka.delivery.InsuranceClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimAttachmentRepository extends JpaRepository<ClaimAttachment, Long> {
    List<ClaimAttachment> findByClaim(InsuranceClaim claim);
} 