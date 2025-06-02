package com.strahovka.controller;

import com.strahovka.delivery.Claims.*;
import com.strahovka.service.ClaimService;
import com.strahovka.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {
    private final ClaimService claimService;
    private final UserRepository userRepository;

    // Main claim operations
    @GetMapping
    public ResponseEntity<Page<InsuranceClaim>> getAllClaims(
            @RequestParam(required = false) ClaimStatus status,
            Pageable pageable) {
        if (status != null) {
            return ResponseEntity.ok(claimService.getClaimsByStatus(status, pageable));
        }
        return ResponseEntity.ok(claimService.getAllClaims(pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByStatus(@PathVariable ClaimStatus status) {
        return ResponseEntity.ok(claimService.getClaimsByStatus(status));
    }

    @GetMapping("/status/{status}/paged")
    public ResponseEntity<Page<InsuranceClaim>> getClaimsByStatusPaged(
            @PathVariable ClaimStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(claimService.getClaimsByStatus(status, pageable));
    }

    // Claim attachments
    @GetMapping("/{claimId}/attachments")
    public ResponseEntity<List<ClaimAttachment>> getAttachmentsByClaim(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.getAttachmentsByClaim(claimId));
    }

    @GetMapping("/attachments/{id}")
    public ResponseEntity<ClaimAttachment> getAttachmentById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getAttachmentById(id));
    }

    @PostMapping("/attachments")
    public ResponseEntity<ClaimAttachment> saveAttachment(@RequestBody ClaimAttachment attachment) {
        return ResponseEntity.ok(claimService.saveAttachment(attachment));
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        claimService.deleteAttachment(id);
        return ResponseEntity.ok().build();
    }

    // Claim messages
    @GetMapping("/{claimId}/messages")
    public ResponseEntity<List<ClaimMessage>> getMessagesByClaim(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.getMessagesByClaim(claimId));
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<ClaimMessage> getMessageById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getMessageById(id));
    }

    @PostMapping("/messages")
    public ResponseEntity<ClaimMessage> saveMessage(@RequestBody ClaimMessage message) {
        return ResponseEntity.ok(claimService.saveMessage(message));
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        claimService.deleteMessage(id);
        return ResponseEntity.ok().build();
    }

    // Claim comments
    @GetMapping("/{claimId}/comments")
    public ResponseEntity<List<ClaimComment>> getCommentsByClaim(@PathVariable Long claimId) {
        return ResponseEntity.ok(claimService.getCommentsByClaim(claimId));
    }

    @GetMapping("/{claimId}/comments/paged")
    public ResponseEntity<Page<ClaimComment>> getCommentsByClaimPaged(
            @PathVariable Long claimId,
            Pageable pageable) {
        return ResponseEntity.ok(claimService.getCommentsByClaimPaged(claimId, pageable));
    }

    @GetMapping("/comments/{id}")
    public ResponseEntity<ClaimComment> getCommentById(@PathVariable Long id) {
        return ResponseEntity.ok(claimService.getCommentById(id));
    }

    @PostMapping("/comments")
    public ResponseEntity<ClaimComment> saveComment(@RequestBody ClaimComment comment) {
        return ResponseEntity.ok(claimService.saveComment(comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        claimService.deleteComment(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{claimId}/process")
    public ResponseEntity<InsuranceClaim> processClaim(
            @PathVariable Long claimId,
            @RequestBody Map<String, Object> payload,
            Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String status = (String) payload.get("status");
        String response = (String) payload.get("response");
        Double amount = payload.get("amount") != null ? ((Number) payload.get("amount")).doubleValue() : null;

        InsuranceClaim claim = claimService.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found: " + claimId));

        claim.setStatus(ClaimStatus.valueOf(status));
        claim.setAmountApproved(amount);
        claim.setProcessedBy(auth.getName());
        claim.setProcessedAt(LocalDateTime.now());

        // Add response as a message
        ClaimMessage message = new ClaimMessage();
        message.setClaim(claim);
        message.setUser(userRepository.findByEmail(auth.getName()).orElseThrow());
        message.setMessage(response);
        message.setSentAt(LocalDateTime.now());
        claimService.saveMessage(message);

        return ResponseEntity.ok(claimService.save(claim));
    }
} 