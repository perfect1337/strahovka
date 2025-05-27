package com.strahovka.repository;

import com.strahovka.delivery.ClaimComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimCommentRepository extends JpaRepository<ClaimComment, Long> {
    List<ClaimComment> findByClaimIdOrderByCreatedAtDesc(Long claimId);
} 