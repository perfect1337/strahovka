package com.strahovka.repository;

import com.strahovka.delivery.ClaimMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClaimMessageRepository extends JpaRepository<ClaimMessage, Long> {
    List<ClaimMessage> findByClaimIdOrderByCreatedAtAsc(Long claimId);
} 