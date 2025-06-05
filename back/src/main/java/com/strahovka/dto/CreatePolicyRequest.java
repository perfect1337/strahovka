package com.strahovka.dto;

import com.strahovka.entity.Insurance.InsuranceCategory;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreatePolicyRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private InsuranceCategory category;
    private LocalDate startDate;
    private LocalDate endDate;
    private String details;
} 