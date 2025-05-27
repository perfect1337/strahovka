package com.strahovka.service;

import com.strahovka.delivery.ClaimComment;
import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.delivery.User;
import com.strahovka.dto.ClaimCommentDTO;
import com.strahovka.repository.ClaimCommentRepository;
import com.strahovka.repository.InsuranceClaimRepository;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimCommentService {
    private final ClaimCommentRepository commentRepository;
    private final InsuranceClaimRepository claimRepository;
    private final UserRepository userRepository;

    @Transactional
    public ClaimCommentDTO createComment(Long claimId, Long userId, String content) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        ClaimComment comment = ClaimComment.builder()
                .claim(claim)
                .author(author)
                .content(content)
                .build();

        comment = commentRepository.save(comment);
        return convertToDTO(comment);
    }

    @Transactional(readOnly = true)
    public List<ClaimCommentDTO> getCommentsByClaim(Long claimId) {
        return commentRepository.findByClaimIdOrderByCreatedAtDesc(claimId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ClaimCommentDTO convertToDTO(ClaimComment comment) {
        return ClaimCommentDTO.builder()
                .id(comment.getId())
                .claimId(comment.getClaim().getId())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName())
                .authorRole(comment.getAuthor().getRole().name())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
} 