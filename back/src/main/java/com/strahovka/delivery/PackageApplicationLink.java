package com.strahovka.delivery;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "package_applications")
@IdClass(PackageApplicationId.class)
public class PackageApplicationLink {

    @Id
    @Column(name = "package_id")
    private Long packageId;

    @Id
    @Column(name = "application_id")
    private Long applicationId;

    @Id
    @Column(name = "application_type", length = 20)
    private String applicationType; // "KASKO", "OSAGO", etc.

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference
    private Insurance.InsurancePackage insurancePackage;

    // Removing this field to prevent Hibernate from creating/expecting specific FKs to sub-application tables.
    // The application_id and application_type fields above are used with the DB trigger for validation.
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "application_id", referencedColumnName = "id", insertable = false, updatable = false)
    // private Insurance.BaseApplication application; // Общий тип
} 