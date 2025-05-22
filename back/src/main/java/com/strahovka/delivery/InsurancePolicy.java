package com.strahovka.delivery;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insurance_policies")
public class InsurancePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название полиса обязательно")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Описание полиса обязательно")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull(message = "Цена обязательна")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private InsuranceCategory category;

    @Column(nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private BigDecimal cashback = BigDecimal.ZERO;

    public void calculateCashback() {
        if (user != null && user.getLevel() != null) {
            switch (user.getLevel()) {
                case GOLD:
                    this.cashback = price.multiply(new BigDecimal("0.10")); // 10% cashback
                    break;
                case SILVER:
                    this.cashback = price.multiply(new BigDecimal("0.05")); // 5% cashback
                    break;
                case WOODEN:
                default:
                    this.cashback = price.multiply(new BigDecimal("0.02")); // 2% cashback
                    break;
            }
        }
    }
} 