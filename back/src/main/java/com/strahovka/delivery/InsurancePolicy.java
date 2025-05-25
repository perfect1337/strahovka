package com.strahovka.delivery;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insurance_policies")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InsurancePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название полиса обязательно")
    @Column(name = "policy_name", nullable = false, length = 255)
    private String name;

    @NotBlank(message = "Описание полиса обязательно")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Цена обязательна")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_policy_category"))
    @JsonIgnoreProperties({"packages", "hibernateLazyInitializer", "handler"})
    private InsuranceCategory category;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_policy_user"))
    @JsonIgnoreProperties({"policies", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "cashback", nullable = false, precision = 10, scale = 2)
    private BigDecimal cashback = BigDecimal.ZERO;

    @PrePersist
    @PreUpdate
    public void calculateCashback() {
        if (user != null && user.getLevel() != null && price != null) {
            BigDecimal cashbackPercentage = BigDecimal.valueOf(user.getLevel().getCashbackPercentage())
                    .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            this.cashback = price.multiply(cashbackPercentage)
                    .setScale(2, RoundingMode.HALF_UP);
        }
    }
}