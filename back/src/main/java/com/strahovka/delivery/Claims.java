package com.strahovka.delivery;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.strahovka.enums.ClaimStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Claims {
    @Entity
    @Table(name = "insurance_claims")
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public static class InsuranceClaim {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "user_id")
        @JsonIgnoreProperties({"claims", "policies", "password", "refreshToken", "accessToken"})
        private User user;

        @ManyToOne
        @JoinColumn(name = "policy_id")
        @JsonIgnoreProperties({"claims", "user"})
        private InsurancePolicy policy;

        private String description;

        @Column(name = "created_at")
        private LocalDateTime createdAt;

        @Enumerated(EnumType.STRING)
        private ClaimStatus status;

        @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonManagedReference
        private List<ClaimAttachment> attachments = new ArrayList<>();

        @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonManagedReference
        private List<ClaimMessage> messages = new ArrayList<>();

        @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
        @JsonManagedReference
        private List<ClaimComment> comments = new ArrayList<>();

        @Column(name = "amount_requested")
        private Double amountRequested;

        @Column(name = "amount_approved")
        private Double amountApproved;

        @Column(name = "processed_by")
        private String processedBy;

        @Column(name = "processed_at")
        private LocalDateTime processedAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
            processedAt = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate() {
            processedAt = LocalDateTime.now();
        }
    }

    @Entity
    @Table(name = "claim_attachments")
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public static class ClaimAttachment {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "claim_id")
        @JsonBackReference
        private InsuranceClaim claim;

        private String fileName;
        private String fileType;
        private String filePath;
        private LocalDateTime uploadedAt;

        @Column(name = "file_size", nullable = false)
        private Long fileSize;

        @Column(name = "uploaded_by", nullable = false)
        private String uploadedBy;

        @PrePersist
        protected void onCreate() {
            uploadedAt = LocalDateTime.now();
        }
    }

    @Entity
    @Table(name = "claim_messages")
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public static class ClaimMessage {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "claim_id")
        @JsonBackReference
        private InsuranceClaim claim;

        @ManyToOne
        @JoinColumn(name = "user_id")
        @JsonIgnoreProperties({"claims", "policies", "password", "refreshToken", "accessToken"})
        private User user;

        @Column(name = "content", nullable = false)
        private String message;

        @Column(name = "created_at", nullable = false)
        private LocalDateTime sentAt;

        @Column(name = "is_read", nullable = false)
        private boolean isRead = false;

        @Column(name = "read_at")
        private LocalDateTime readAt;

        @PrePersist
        protected void onCreate() {
            sentAt = LocalDateTime.now();
        }
    }

    @Entity
    @Table(name = "claim_comments")
    @Data
    @NoArgsConstructor
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public static class ClaimComment {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "claim_id")
        @JsonBackReference
        private InsuranceClaim claim;

        @ManyToOne
        @JoinColumn(name = "user_id")
        @JsonIgnoreProperties({"claims", "policies", "password", "refreshToken", "accessToken"})
        private User user;

        private String comment;
        private LocalDateTime createdAt;

        @Column(name = "created_by", nullable = false)
        private String createdBy;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @Column(name = "updated_by")
        private String updatedBy;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
            updatedAt = LocalDateTime.now();
        }

        @PreUpdate
        protected void onUpdate() {
            updatedAt = LocalDateTime.now();
        }
    }
} 