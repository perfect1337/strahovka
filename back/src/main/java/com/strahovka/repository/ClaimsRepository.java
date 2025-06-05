package com.strahovka.repository;

import com.strahovka.entity.InsurancePolicy;
import com.strahovka.entity.Claims.*;
import com.strahovka.entity.User;
import com.strahovka.enums.ClaimStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClaimsRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByPolicy(InsurancePolicy policy);
    List<InsuranceClaim> findByUser(User user);
    List<InsuranceClaim> findByStatus(ClaimStatus status);
    Page<InsuranceClaim> findByStatus(ClaimStatus status, Pageable pageable);
    Page<InsuranceClaim> findAll(Pageable pageable);

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

    @Query("SELECT m FROM com.strahovka.entity.Claims$ClaimMessage m WHERE m.claim.id = :claimId ORDER BY m.sentAt DESC")
    List<ClaimMessage> findMessagesByClaim(@Param("claimId") Long claimId);

    @Query("SELECT m FROM Claims$ClaimMessage m WHERE m.id = :id")
    ClaimMessage findMessageById(@Param("id") Long id);

    @Modifying
    @Query("INSERT INTO Claims$ClaimMessage (claim, user, message, sentAt, isRead, readAt) " +
           "VALUES (:#{#message.claim}, :#{#message.user}, :#{#message.message}, :#{#message.sentAt}, " +
           ":#{#message.isRead}, :#{#message.readAt})")
    void saveMessage(@Param("message") ClaimMessage message);

    @Modifying
    @Query("DELETE FROM Claims$ClaimMessage m WHERE m.id = :id")
    void deleteMessage(@Param("id") Long id);

    @Query("SELECT c FROM Claims$ClaimComment c WHERE c.claim.id = :claimId")
    List<ClaimComment> findCommentsByClaim(@Param("claimId") Long claimId);

    @Query("SELECT c FROM Claims$ClaimComment c WHERE c.claim.id = :claimId")
    Page<ClaimComment> findCommentsByClaimPaged(@Param("claimId") Long claimId, Pageable pageable);

    @Query("SELECT c FROM Claims$ClaimComment c WHERE c.id = :id")
    ClaimComment findCommentById(@Param("id") Long id);

    @Modifying
    @Query("INSERT INTO Claims$ClaimComment (claim, user, commentText, createdAt) " +
           "VALUES (:#{#comment.claim}, :#{#comment.user}, :#{#comment.commentText}, :#{#comment.createdAt})")
    ClaimComment saveComment(@Param("comment") ClaimComment comment);

    @Modifying
    @Query("DELETE FROM Claims$ClaimComment c WHERE c.id = :id")
    void deleteComment(@Param("id") Long id);

    @Query("SELECT m FROM com.strahovka.entity.Claims$InsuranceClaim ic JOIN ic.messages m WHERE ic.id = :claimId")
    List<Object[]> findMessagesByClaimRaw(@Param("claimId") Long claimId);

    Optional<InsuranceClaim> findByIdAndUser(Long claimId, User user);
} 