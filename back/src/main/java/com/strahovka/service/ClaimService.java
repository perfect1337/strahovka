package com.strahovka.service;

import com.strahovka.entity.Claims.*;
import com.strahovka.enums.ClaimStatus;
import com.strahovka.repository.ClaimsRepository;
import com.strahovka.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClaimService {
    private final ClaimsRepository claimsRepository;
    private final UserRepository userRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<InsuranceClaim> getClaimsByStatus(ClaimStatus status) {
        return claimsRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public Page<InsuranceClaim> getClaimsByStatus(ClaimStatus status, Pageable pageable) {
        return claimsRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<InsuranceClaim> getAllClaims(Pageable pageable) {
        return claimsRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<ClaimAttachment> getAttachmentsByClaim(Long claimId) {
        return claimsRepository.findAttachmentsByClaim(claimId);
    }

    @Transactional(readOnly = true)
    public ClaimAttachment getAttachmentById(Long id) {
        return claimsRepository.findAttachmentById(id);
    }

    @Transactional
    public ClaimAttachment saveAttachment(ClaimAttachment attachment) {
        attachment.setUploadedAt(LocalDateTime.now());
        return claimsRepository.saveAttachment(attachment);
    }

    @Transactional
    public void deleteAttachment(Long id) {
        claimsRepository.deleteAttachment(id);
    }

    @Transactional(readOnly = true)
    public List<ClaimMessage> getMessagesByClaim(Long claimId) {
        return claimsRepository.findMessagesByClaim(claimId);
    }

    @Transactional(readOnly = true)
    public ClaimMessage getMessageById(Long id) {
        return claimsRepository.findMessageById(id);
    }

    @Transactional
    public ClaimMessage saveMessage(ClaimMessage message) {
        message.setSentAt(LocalDateTime.now());
        entityManager.persist(message);
        entityManager.flush();
        return message;
    }

    @Transactional
    public void deleteMessage(Long id) {
        claimsRepository.deleteMessage(id);
    }

    @Transactional(readOnly = true)
    public List<ClaimComment> getCommentsByClaim(Long claimId) {
        return claimsRepository.findCommentsByClaim(claimId);
    }

    @Transactional(readOnly = true)
    public Page<ClaimComment> getCommentsByClaimPaged(Long claimId, Pageable pageable) {
        return claimsRepository.findCommentsByClaimPaged(claimId, pageable);
    }

    @Transactional(readOnly = true)
    public ClaimComment getCommentById(Long id) {
        return claimsRepository.findCommentById(id);
    }

    @Transactional
    public ClaimComment saveComment(ClaimComment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return claimsRepository.saveComment(comment);
    }

    @Transactional
    public void deleteComment(Long id) {
        claimsRepository.deleteComment(id);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<InsuranceClaim> findById(Long id) {
        return claimsRepository.findById(id);
    }

    @Transactional
    public InsuranceClaim save(InsuranceClaim claim) {
        return claimsRepository.save(claim);
    }
} 