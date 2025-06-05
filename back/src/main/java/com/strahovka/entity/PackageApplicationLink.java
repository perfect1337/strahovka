package com.strahovka.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.strahovka.entity.Insurance.InsurancePackage;

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
    private String applicationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", referencedColumnName = "id", insertable = false, updatable = false)
    @JsonBackReference
    private InsurancePackage insurancePackage;

} 