package com.strahovka.delivery;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "kasko_applications")
public class KaskoApplication extends BaseApplication {
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
    @Column(name = "license_plate")
    private String licensePlate;

    @NotNull(message = "Car value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Car value must be greater than 0")
    @Column(name = "car_value", precision = 10, scale = 2)
    private BigDecimal carValue;

    @NotBlank(message = "Driver's license number is required")
    @Column(name = "driver_license_number", nullable = false)
    private String driverLicenseNumber;

    @NotNull(message = "Driver experience years is required")
    @Min(value = 0, message = "Driver experience cannot be negative")
    @Max(value = 70, message = "Driver experience years seems too high")
    @Column(name = "driver_experience_years")
    private Integer driverExperienceYears;

    @Column(name = "has_anti_theft_system")
    private Boolean hasAntiTheftSystem = false;

    @Column(name = "garage_parking")
    private Boolean garageParking = false;

    @Column(name = "previous_insurance_number")
    private String previousInsuranceNumber;
} 