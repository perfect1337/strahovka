package com.strahovka.service;

import com.strahovka.delivery.ClaimAttachment;
import com.strahovka.delivery.InsuranceClaim;
import com.strahovka.repository.ClaimAttachmentRepository;
import com.strahovka.repository.InsuranceClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClaimAttachmentService {
    private final ClaimAttachmentRepository attachmentRepository;
    private final InsuranceClaimRepository claimRepository;

    @Transactional
    public ClaimAttachment addAttachment(Long claimId, MultipartFile file) throws IOException {
        InsuranceClaim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Страховой случай не найден"));

        ClaimAttachment attachment = new ClaimAttachment();
        attachment.setClaim(claim);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setFileData(file.getBytes());

        return attachmentRepository.save(attachment);
    }

    public List<ClaimAttachment> getClaimAttachments(Long claimId) {
        InsuranceClaim claim = claimRepository.findById(claimId)
            .orElseThrow(() -> new RuntimeException("Страховой случай не найден"));
        return attachmentRepository.findByClaim(claim);
    }

    public ClaimAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new RuntimeException("Вложение не найдено"));
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        attachmentRepository.deleteById(attachmentId);
    }
} 