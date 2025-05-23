package com.strahovka.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class KaskoApplicationRequest {
    @NotBlank(message = "Car make is required")
    @Size(max = 100, message = "Car make must not exceed 100 characters")
    private String carMake;

    @NotBlank(message = "Car model is required")
    @Size(max = 100, message = "Car model must not exceed 100 characters")
    private String carModel;

    @NotNull(message = "Car year is required")
    @Min(value = 1900, message = "Car year must be 1900 or later")
    @Max(value = 2025, message = "Car year must not exceed 2025")
    private Integer carYear;

    @NotBlank(message = "VIN number is required")
    @Size(min = 17, max = 17, message = "VIN number must be exactly 17 characters")
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]+$", message = "Invalid VIN number format")
    private String vinNumber;

    @NotBlank(message = "License plate is required")
    @Size(max = 20, message = "License plate must not exceed 20 characters")
    private String licensePlate;

    @NotNull(message = "Car value is required")
    @DecimalMin(value = "0.01", message = "Car value must be greater than 0")
    private BigDecimal carValue;

    @NotBlank(message = "Driver's license number is required")
    @Size(max = 50, message = "Driver's license number must not exceed 50 characters")
    private String driverLicenseNumber;

    @NotNull(message = "Driver experience years is required")
    @Min(value = 0, message = "Driver experience cannot be negative")
    @Max(value = 70, message = "Driver experience cannot exceed 70 years")
    private Integer driverExperienceYears;

    private Boolean hasAntiTheftSystem = false;
    private Boolean garageParking = false;
    private String previousInsuranceNumber;
} 