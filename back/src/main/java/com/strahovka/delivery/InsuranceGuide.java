package com.strahovka.delivery;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "insurance_guides")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InsuranceGuide {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Название справочника обязательно")
    @Column(name = "title", nullable = false)
    private String title;

    @NotBlank(message = "Описание справочника обязательно")
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Тип страхования обязателен")
    @Column(name = "insurance_type", nullable = false, length = 50)
    private String insuranceType;

    @NotBlank(message = "Важные заметки обязательны")
    @Column(name = "important_notes", nullable = false, columnDefinition = "TEXT")
    private String importantNotes;

    @NotBlank(message = "Необходимые документы обязательны")
    @Column(name = "required_documents", nullable = false, columnDefinition = "TEXT")
    private String requiredDocuments;

    @NotBlank(message = "Детали покрытия обязательны")
    @Column(name = "coverage_details", nullable = false, columnDefinition = "TEXT")
    private String coverageDetails;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @NotNull(message = "Порядок отображения обязателен")
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 