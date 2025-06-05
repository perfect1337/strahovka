package com.strahovka.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailDTO {
    private Long id;
    private String applicationType;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal calculatedAmount;
    private String displayName;
} 