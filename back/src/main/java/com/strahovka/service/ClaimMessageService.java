package com.strahovka.service;

import com.strahovka.delivery.ClaimMessage;
import com.strahovka.delivery.ClaimStatus;
import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.delivery.User;
import com.strahovka.repository.ClaimMessageRepository;
import com.strahovka.repository.InsuranceClaimRepository;
import com.strahovka.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClaimMessageService {

    @Autowired
    private ClaimMessageRepository messageRepository;

    @Autowired
    private InsuranceClaimRepository claimRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ClaimMessage> getMessagesByClaim(Long claimId) {
        return messageRepository.findByClaimIdOrderByCreatedAtAsc(claimId);
    }

    @Transactional
    public ClaimMessage addMessage(Long claimId, Long userId, String message) {
        InsuranceClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new RuntimeException("Claim not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClaimMessage claimMessage = new ClaimMessage();
        claimMessage.setClaim(claim);
        claimMessage.setUser(user);
        claimMessage.setMessage(message);

        return messageRepository.save(claimMessage);
    }

    @Transactional(readOnly = true)
    public Page<InsuranceClaim> getAllClaimsWithMessages(Pageable pageable) {
        return claimRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<InsuranceClaim> getPendingClaimsWithMessages(Pageable pageable) {
        return claimRepository.findByStatus(ClaimStatus.PENDING, pageable);
    }
} 