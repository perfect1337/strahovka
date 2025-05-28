package com.strahovka.delivery;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insurance_applications")
public class InsuranceApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private InsurancePackage insurancePackage;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "passport_number", nullable = false)
    private String passportNumber;

    @Column(name = "passport_issued_by", nullable = false)
    private String passportIssuedBy;

    @Column(name = "passport_issued_date", nullable = false)
    private LocalDate passportIssuedDate;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false)
    private String address;

    @Column(name = "additional_info")
    private String additionalInfo;

    public Long getPackageId() {
        return insurancePackage != null ? insurancePackage.getId() : null;
    }
} 