package com.strahovka.dto;

import com.strahovka.entity.Insurance.InsuranceCategory;
import com.strahovka.enums.PolicyStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
public class InsurancePolicyDTO {
    private Long id;
    private Long userPolicyNumber;
    private String name;
    private String description;
    private BigDecimal price;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
    private PolicyStatus status;
    private InsuranceCategoryDTO category;

    @Data
    @NoArgsConstructor
    public static class InsuranceCategoryDTO {
        private Long id;
        private String name;
        private String description;
        private String type;
    }
} 