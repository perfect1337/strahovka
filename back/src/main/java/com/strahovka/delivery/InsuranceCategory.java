package com.strahovka.delivery;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.util.Set;
import java.util.HashSet;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insurance_categories")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InsuranceCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название категории обязательно")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Описание категории обязательно")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull(message = "Базовая цена обязательна")
    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @NotBlank(message = "Тип страхования обязателен")
    @Column(name = "type", nullable = false)
    private String type;

    @ManyToMany(mappedBy = "categories")
    @JsonIgnoreProperties({"categories", "hibernateLazyInitializer", "handler"})
    private Set<InsurancePackage> packages = new HashSet<>();
} 