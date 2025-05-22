package com.strahovka.controller;

import com.strahovka.delivery.ClaimAttachment;
import com.strahovka.service.ClaimAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/insurance/claims/{claimId}/attachments")
@RequiredArgsConstructor
public class ClaimAttachmentController {
    private final ClaimAttachmentService attachmentService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long claimId,
            @RequestParam("file") MultipartFile file) throws IOException {
        ClaimAttachment attachment = attachmentService.addAttachment(claimId, file);
        return ResponseEntity.ok(mapToResponse(attachment));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable Long claimId) {
        List<AttachmentResponse> attachments = attachmentService.getClaimAttachments(claimId)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/{attachmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long attachmentId) {
        ClaimAttachment attachment = attachmentService.getAttachment(attachmentId);
        ByteArrayResource resource = new ByteArrayResource(attachment.getFileData());

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(attachment.getFileType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
            .body(resource);
    }

    @DeleteMapping("/{attachmentId}")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.ok().build();
    }

    private AttachmentResponse mapToResponse(ClaimAttachment attachment) {
        return new AttachmentResponse(
            attachment.getId(),
            attachment.getFileName(),
            attachment.getFileType(),
            attachment.getFileSize(),
            attachment.getCreatedAt()
        );
    }

    record AttachmentResponse(Long id, String fileName, String fileType, Long fileSize, java.time.LocalDateTime createdAt) {}
} 