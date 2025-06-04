package com.strahovka.delivery;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.strahovka.enums.PackageType;
import com.strahovka.enums.PackageStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.Where;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Objects;
import java.util.ArrayList;

public class Insurance {
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity(name = "InsurancePackageEntity")
    @Table(name = "insurance_packages")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @EqualsAndHashCode(exclude = {"categories", "applicationLinks"})
    public static class InsurancePackage {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @NotBlank(message = "Название пакета обязательно")
        @Column(nullable = false)
        private String name;

        @NotBlank(message = "Описание пакета обязательно")
        @Column(nullable = false, length = 1000)
        private String description;

        @Column(name = "baseprice", nullable = true, precision = 10, scale = 2)
        private BigDecimal basePrice;

        @Min(value = 0, message = "Скидка не может быть меньше 0%")
        @Max(value = 100, message = "Скидка не может быть больше 100%")
        @Column(nullable = false)
        @Builder.Default
        private int discount = 0;

        @ManyToMany(fetch = FetchType.LAZY)
        @JoinTable(
            name = "package_categories",
            joinColumns = @JoinColumn(name = "package_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
        )
        @JsonIgnoreProperties({"packages", "hibernateLazyInitializer", "handler"})
        @Builder.Default
        private Set<InsuranceCategory> categories = new HashSet<>();

        @Column(nullable = false)
        @Builder.Default
        private boolean active = true;

        @ManyToOne
        @JoinColumn(name = "user_id", nullable = true)
        @JsonIgnoreProperties(value = {"insurancePackages", "policies", "claims", "applications", "handler", "hibernateLazyInitializer"}, allowSetters = true)
        private User user;

        @OneToMany(mappedBy = "insurancePackage", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
        @Builder.Default
        @ToString.Exclude
        @JsonManagedReference
        private List<PackageApplicationLink> applicationLinks = new ArrayList<>();

        @Column(name = "original_total_amount", nullable = true)
        private BigDecimal originalTotalAmount;

        @Column(name = "final_amount", nullable = true)
        private BigDecimal finalAmount;

        @Column(name = "created_at")
        @Builder.Default
        private LocalDateTime createdAt = LocalDateTime.now();

        @Column(name = "package_type")
        @Enumerated(EnumType.STRING)
        private PackageType packageType;

        @Column(name = "status")
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private PackageStatus status = PackageStatus.PENDING;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "insurance_categories")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @EqualsAndHashCode(exclude = {"packages"})
    public static class InsuranceCategory {
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Entity
    @Table(name = "insurance_guides")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    public static class InsuranceGuide {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @NotBlank(message = "Название справочника обязательно")
        @Column(name = "title", nullable = false)
        private String title;

        @NotBlank(message = "Описание справочника обязательно")
        @Column(name = "description", nullable = false)
        private String description;

        @NotBlank(message = "Тип страхования обязателен")
        @Column(name = "insurance_type", nullable = false, length = 50)
        private String insuranceType;

        @NotBlank(message = "Важные заметки обязательны")
        @Column(name = "important_notes", nullable = false)
        private String importantNotes;

        @NotBlank(message = "Необходимые документы обязательны")
        @Column(name = "required_documents", nullable = false)
        private String requiredDocuments;

        @NotBlank(message = "Детали покрытия обязательны")
        @Column(name = "coverage_details", nullable = false)
        private String coverageDetails;

        @Column(name = "calculation_rules", columnDefinition = "text")
        private String calculationRules;

        @Column(name = "active", nullable = false)
        private boolean active = true;

        @NotNull(message = "Порядок отображения обязателен")
        @Column(name = "display_order", nullable = false)
        private Integer displayOrder;

        @Column(name = "created_at", nullable = false, updatable = false)
        private LocalDateTime createdAt;

        @Column(name = "updated_at")
        private LocalDateTime updatedAt;

        @Column(name = "content")
        private String content;
    }

    @Entity
    @Table(name = "base_applications")
    @Inheritance(strategy = InheritanceType.JOINED)
    @DiscriminatorColumn(name = "application_type")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class BaseApplication {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne
        @JoinColumn(name = "user_id")
        private User user;

        @Column(name = "application_date")
        private LocalDateTime applicationDate;

        @Column(name = "status", nullable = false)
        private String status = "PENDING";

        @Column(name = "calculated_amount")
        private BigDecimal calculatedAmount;

        @Column(name = "processed_at")
        private LocalDateTime processedAt;

        @Column(name = "processed_by")
        private String processedBy;

        @Column(name = "notes")
        private String notes;

        @ManyToOne
        @JoinColumn(name = "policy_id")
        private InsurancePolicy policy;

        @Column(name = "start_date")
        private LocalDate startDate;

        @Column(name = "end_date")
        private LocalDate endDate;

        @Transient
        private String applicationType;

        public void setApplicationType(String applicationType) {
            this.applicationType = applicationType;
        }

        public String getApplicationType() {
            return this.applicationType;
        }
    }

    @Entity
    @Table(name = "kasko_applications")
    @DiscriminatorValue("KASKO")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class KaskoApplication extends BaseApplication {
        @NotBlank(message = "Car make is required")
        @Column(name = "car_make", nullable = false)
        private String carMake;

        @NotBlank(message = "Car model is required")
        @Column(name = "car_model", nullable = false)
        private String carModel;

        @NotNull(message = "Car year is required")
        @Min(value = 1900, message = "Car year must be 1900 or later")
        @Max(value = 2025, message = "Car year cannot be in the future")
        @Column(name = "car_year", nullable = false)
        private Integer carYear;

        @NotBlank(message = "VIN number is required")
        @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "Invalid VIN number format")
        @Column(name = "vin_number", nullable = false)
        private String vinNumber;

        @NotBlank(message = "License plate is required")
        @Column(name = "license_plate", nullable = false)
        private String licensePlate;

        @NotNull(message = "Car value is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Car value must be greater than 0")
        @Column(name = "car_value", nullable = false)
        private BigDecimal carValue;

        @NotBlank(message = "Driver's license number is required")
        @Column(name = "driver_license_number", nullable = false)
        private String driverLicenseNumber;

        @NotNull(message = "Driver experience years is required")
        @Min(value = 0, message = "Driver experience cannot be negative")
        @Max(value = 70, message = "Driver experience years seems too high")
        @Column(name = "driver_experience_years", nullable = false)
        private Integer driverExperienceYears;

        @Column(name = "has_anti_theft_system")
        private Boolean hasAntiTheftSystem;

        @Column(name = "garage_parking")
        private Boolean garageParking;

        @Column(name = "previous_insurance_number")
        private String previousInsuranceNumber;

        @Column(name = "duration", nullable = false)
        private Integer duration;
    }

    @Entity
    @Table(name = "osago_applications")
    @DiscriminatorValue("OSAGO")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class OsagoApplication extends BaseApplication {
        @Column(name = "car_make", nullable = false)
        private String carMake;

        @Column(name = "car_model", nullable = false)
        private String carModel;

        @Column(name = "car_year", nullable = false)
        private Integer carYear;

        @Column(name = "vin_number", nullable = false)
        private String vinNumber;

        @Column(name = "license_plate", nullable = false)
        private String licensePlate;

        @Column(name = "registration_certificate", nullable = false)
        private String registrationCertificate;

        @Column(name = "driver_license_number", nullable = true)
        private String driverLicenseNumber;

        @Column(name = "driver_experience_years", nullable = true)
        private Integer driverExperienceYears;

        @Column(name = "engine_power", nullable = false)
        private Integer enginePower;

        @Column(name = "region_registration", nullable = false)
        private String regionRegistration;

        @Column(name = "has_accidents_last_year")
        private Boolean hasAccidentsLastYear;

        @Column(name = "previous_policy_number")
        private String previousPolicyNumber;

        @Column(name = "is_unlimited_drivers")
        private Boolean isUnlimitedDrivers;

        @Column(name = "duration_months")
        private Integer duration;
    }

    @Entity
    @Table(name = "property_applications")
    @DiscriminatorValue("PROPERTY")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class PropertyApplication extends BaseApplication {
        @Column(name = "property_type", nullable = false)
        private String propertyType;

        @Column(name = "address", nullable = false)
        private String address;

        @Column(name = "property_area", nullable = false, precision = 10, scale = 2)
        private BigDecimal propertyArea;

        @Column(name = "year_built", nullable = false)
        private Integer yearBuilt;

        @Column(name = "construction_type", nullable = false)
        private String constructionType;

        @Column(name = "property_value", nullable = false, precision = 19, scale = 2)
        private BigDecimal propertyValue;

        @Column(name = "has_security_system")
        private Boolean hasSecuritySystem;

        @Column(name = "has_fire_alarm")
        private Boolean hasFireAlarm;

        @Column(name = "cover_natural_disasters")
        private Boolean coverNaturalDisasters = true;

        @Column(name = "cover_theft")
        private Boolean coverTheft = true;

        @Column(name = "cover_third_party_liability")
        private Boolean coverThirdPartyLiability = false;

        @Column(name = "ownership_document_number", nullable = false)
        private String ownershipDocumentNumber;

        @Column(name = "cadastral_number", nullable = false)
        private String cadastralNumber;

        @Column(name = "has_mortage")
        private Boolean hasMortgage;

        @Column(name = "mortage_bank")
        private String mortgageBank;
    }

    @Entity
    @Table(name = "health_applications")
    @DiscriminatorValue("HEALTH")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class HealthApplication extends BaseApplication {
        @Column(name = "birth_date", nullable = false)
        private LocalDate birthDate;

        @Column(name = "passport_number", nullable = false)
        private String passportNumber;

        @Column(name = "snils", nullable = false)
        private String snils;

        @Column(name = "has_chronic_diseases")
        private Boolean hasChronicDiseases;

        @Column(name = "chronic_diseases_details")
        private String chronicDiseasesDetails;

        @Column(name = "has_disabilities")
        private Boolean hasDisabilities;

        @Column(name = "disabilities_details")
        private String disabilitiesDetails;

        @Column(name = "smoking_status")
        private Boolean smokingStatus;

        @Column(name = "cover_dental")
        private Boolean coverDental = false;

        @Column(name = "cover_vision")
        private Boolean coverVision = false;

        @Column(name = "cover_maternity")
        private Boolean coverMaternity = false;

        @Column(name = "cover_emergency")
        private Boolean coverEmergency = true;

        @Column(name = "preferred_clinic")
        private String preferredClinic;

        @Column(name = "family_doctor_needed")
        private Boolean familyDoctorNeeded;

        @Column(name = "coverage_type")
        private String coverageType;

        @Column(name = "coverage_amount", precision = 10, scale = 2)
        private BigDecimal coverageAmount;
    }

    @Entity
    @Table(name = "travel_applications")
    @DiscriminatorValue("TRAVEL")
    @Getter
    @Setter
    @NoArgsConstructor
    public static class TravelApplication extends BaseApplication {
        @Column(name = "passport_number", nullable = false)
        private String passportNumber;

        @Column(name = "passport_expiry", nullable = false)
        private LocalDate passportExpiry;

        @Column(name = "destination_country", nullable = false)
        private String destinationCountry;

        @Column(name = "travel_start_date", nullable = false)
        private LocalDate travelStartDate;

        @Column(name = "travel_end_date", nullable = false)
        private LocalDate travelEndDate;

        @Column(name = "purpose_of_trip", nullable = false)
        private String purposeOfTrip;

        @Column(name = "cover_medical_expenses")
        private Boolean coverMedicalExpenses = true;

        @Column(name = "cover_accidents")
        private Boolean coverAccidents = true;

        @Column(name = "cover_luggage")
        private Boolean coverLuggage = false;

        @Column(name = "cover_trip_cancellation")
        private Boolean coverTripCancellation = false;

        @Column(name = "cover_sports_activities")
        private Boolean coverSportsActivities = false;

        @Column(name = "has_chronic_diseases")
        private Boolean hasChronicDiseases;

        @Column(name = "planned_sports_activities")
        private String plannedSportsActivities;
    }
} 