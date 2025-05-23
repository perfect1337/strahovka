package com.strahovka.delivery;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insurance_packages")
public class InsurancePackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название пакета обязательно")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Описание пакета обязательно")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull(message = "Базовая цена обязательна")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Min(value = 0, message = "Скидка не может быть меньше 0%")
    @Max(value = 100, message = "Скидка не может быть больше 100%")
    @Column(nullable = false)
    private int discount = 0;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "package_categories",
        joinColumns = @JoinColumn(name = "package_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<InsuranceCategory> categories = new HashSet<>();

    @Column(nullable = false)
    private boolean active = true;
} 