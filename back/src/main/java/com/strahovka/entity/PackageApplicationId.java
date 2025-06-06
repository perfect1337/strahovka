package com.strahovka.entity;

import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class PackageApplicationId implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long packageId;
    private Long applicationId;
    private String applicationType;
} 