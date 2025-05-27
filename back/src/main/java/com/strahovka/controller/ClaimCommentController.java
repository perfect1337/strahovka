package com.strahovka.controller;

import com.strahovka.dto.ClaimCommentDTO;
import com.strahovka.dto.CreateCommentRequest;
import com.strahovka.security.CurrentUser;
import com.strahovka.service.ClaimCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance/claims/{claimId}/comments")
@RequiredArgsConstructor
public class ClaimCommentController {
    private final ClaimCommentService commentService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR')")
    public ResponseEntity<List<ClaimCommentDTO>> getComments(@PathVariable Long claimId) {
        return ResponseEntity.ok(commentService.getCommentsByClaim(claimId));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR')")
    public ResponseEntity<ClaimCommentDTO> createComment(
            @PathVariable Long claimId,
            @RequestBody CreateCommentRequest request,
            @CurrentUser Long userId) {
        return ResponseEntity.ok(commentService.createComment(claimId, userId, request.getContent()));
    }
} 