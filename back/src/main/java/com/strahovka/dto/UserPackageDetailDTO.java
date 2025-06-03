package com.strahovka.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.strahovka.enums.PackageStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPackageDetailDTO {
    private Long id;
    private String name;
    private String description;
    private int discount;
    private boolean active;
    private BigDecimal originalTotalAmount;
    private BigDecimal finalAmount;
    private LocalDateTime createdAt;
    private PackageStatus status;
    private List<ApplicationDetailDTO> applicationsInPackage;
    private List<String> categoryNames; // Просто список названий категорий для отображения
} 