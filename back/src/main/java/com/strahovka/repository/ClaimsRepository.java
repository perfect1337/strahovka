package com.strahovka.repository;

import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.Claims.*;
import com.strahovka.delivery.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface ClaimsRepository extends JpaRepository<InsuranceClaim, Long> {
    // Main claim operations
    List<InsuranceClaim> findByPolicy(InsurancePolicy policy);
    List<InsuranceClaim> findByUser(User user);
    List<InsuranceClaim> findByStatus(ClaimStatus status);
    Page<InsuranceClaim> findByStatus(ClaimStatus status, Pageable pageable);
    Page<InsuranceClaim> findAll(Pageable pageable);

    // Claim attachments
    @Query("SELECT a FROM Claims$ClaimAttachment a WHERE a.claim.id = :claimId")
    List<ClaimAttachment> findAttachmentsByClaim(@Param("claimId") Long claimId);

    @Query("SELECT a FROM Claims$ClaimAttachment a WHERE a.id = :id")
    ClaimAttachment findAttachmentById(@Param("id") Long id);

    @Modifying
    @Query("INSERT INTO Claims$ClaimAttachment (claim, fileName, fileType, fileSize, filePath, uploadedAt, uploadedBy) " +
           "VALUES (:#{#attachment.claim}, :#{#attachment.fileName}, :#{#attachment.fileType}, " +
           ":#{#attachment.fileSize}, :#{#attachment.filePath}, :#{#attachment.uploadedAt}, :#{#attachment.uploadedBy})")
    ClaimAttachment saveAttachment(@Param("attachment") ClaimAttachment attachment);

    @Modifying
    @Query("DELETE FROM Claims$ClaimAttachment a WHERE a.id = :id")
    void deleteAttachment(@Param("id") Long id);

    // Claim messages
    @Query("SELECT m FROM com.strahovka.delivery.Claims$ClaimMessage m WHERE m.claim.id = :claimId ORDER BY m.sentAt DESC")
    List<ClaimMessage> findMessagesByClaim(@Param("claimId") Long claimId);

    @Query("SELECT m FROM Claims$ClaimMessage m WHERE m.id = :id")
    ClaimMessage findMessageById(@Param("id") Long id);

    @Modifying
    @Query("INSERT INTO Claims$ClaimMessage (claim, user, message, sentAt) " +
           "VALUES (:#{#message.claim}, :#{#message.user}, :#{#message.message}, :#{#message.sentAt})")
    void saveMessage(@Param("message") ClaimMessage message);

    @Modifying
    @Query("DELETE FROM Claims$ClaimMessage m WHERE m.id = :id")
    void deleteMessage(@Param("id") Long id);

    // Claim comments
    @Query("SELECT c FROM Claims$ClaimComment c WHERE c.claim.id = :claimId")
    List<ClaimComment> findCommentsByClaim(@Param("claimId") Long claimId);

    @Query("SELECT c FROM Claims$ClaimComment c WHERE c.claim.id = :claimId")
    Page<ClaimComment> findCommentsByClaimPaged(@Param("claimId") Long claimId, Pageable pageable);

    @Query("SELECT c FROM Claims$ClaimComment c WHERE c.id = :id")
    ClaimComment findCommentById(@Param("id") Long id);

    @Modifying
    @Query("INSERT INTO Claims$ClaimComment (claim, comment, createdAt, createdBy, updatedAt, updatedBy) " +
           "VALUES (:#{#comment.claim}, :#{#comment.comment}, :#{#comment.createdAt}, " +
           ":#{#comment.createdBy}, :#{#comment.updatedAt}, :#{#comment.updatedBy})")
    ClaimComment saveComment(@Param("comment") ClaimComment comment);

    @Modifying
    @Query("DELETE FROM Claims$ClaimComment c WHERE c.id = :id")
    void deleteComment(@Param("id") Long id);
} 