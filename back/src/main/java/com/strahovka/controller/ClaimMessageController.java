package com.strahovka.controller;

import com.strahovka.delivery.ClaimMessage;
import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.delivery.User;
import com.strahovka.repository.UserRepository;
import com.strahovka.service.ClaimMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance/claims")
public class ClaimMessageController {

    @Autowired
    private ClaimMessageService messageService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{claimId}/messages")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR')")
    public ResponseEntity<List<ClaimMessage>> getMessages(@PathVariable Long claimId) {
        return ResponseEntity.ok(messageService.getMessagesByClaim(claimId));
    }

    @PostMapping("/{claimId}/messages")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MODERATOR')")
    public ResponseEntity<ClaimMessage> addMessage(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(messageService.addMessage(
                claimId,
                user.getId(),
                payload.get("message")
        ));
    }

    @GetMapping("/all-with-messages")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MODERATOR')")
    public ResponseEntity<Page<InsuranceClaim>> getAllClaimsWithMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(messageService.getAllClaimsWithMessages(PageRequest.of(page, size)));
    }

    @GetMapping("/pending-with-messages")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MODERATOR')")
    public ResponseEntity<Page<InsuranceClaim>> getPendingClaimsWithMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(messageService.getPendingClaimsWithMessages(PageRequest.of(page, size)));
    }
} 