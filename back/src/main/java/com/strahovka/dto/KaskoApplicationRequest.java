package com.strahovka.dto;

import com.strahovka.delivery.Insurance.KaskoApplication;
import com.strahovka.delivery.User; // Assuming User class for common fields
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class KaskoApplicationRequest extends BaseApplicationRequest {
    // User fields (from form data)
    private String email;
    private String password; // Optional, can be derived
    private String firstName;
    private String lastName;
    private String middleName;
    private String phone;

    // Kasko specific fields
    @NotBlank(message = "Car make is required")
    @Size(max = 100, message = "Car make must not exceed 100 characters")
    private String carMake;

    @NotBlank(message = "Car model is required")
    @Size(max = 100, message = "Car model must not exceed 100 characters")
    private String carModel;

    @NotNull(message = "Car year is required")
    @Min(value = 1900, message = "Car year must be 1900 or later")
    @Max(value = 2025, message = "Car year cannot be in the future")
    private Integer carYear;

    @NotBlank(message = "VIN number is required")
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "Invalid VIN number format")
    private String vinNumber;

    @NotBlank(message = "License plate is required")
    @Size(min = 6, max = 15, message = "License plate must be between 6 and 15 characters")
    private String licensePlate;

    @NotNull(message = "Car value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Car value must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Car value format is invalid")
    private BigDecimal carValue;

    @NotBlank(message = "Driver's license number is required")
    @Size(min = 5, max = 20, message = "Driver license number must be between 5 and 20 characters")
    private String driverLicenseNumber;

    @NotNull(message = "Driver experience years is required")
    @Min(value = 0, message = "Driver experience cannot be negative")
    @Max(value = 70, message = "Driver experience years seems too high")
    private Integer driverExperienceYears;

    private Boolean hasAntiTheftSystem;
    private Boolean garageParking;
    private String previousInsuranceNumber;

    @NotNull(message = "Duration in months is required")
    @Min(value = 1, message = "Duration must be at least 1 month")
    @Max(value = 60, message = "Duration cannot exceed 60 months")
    private Integer duration;

    private LocalDate startDate;

    public KaskoApplication toKaskoApplication() {
        KaskoApplication application = new KaskoApplication();
        application.setEmail(getEmail());
        application.setStartDate(getStartDate());
        application.setCarMake(carMake);
        application.setCarModel(carModel);
        application.setCarYear(carYear);
        application.setVinNumber(vinNumber);
        application.setLicensePlate(licensePlate);
        application.setCarValue(carValue);
        application.setDriverLicenseNumber(driverLicenseNumber);
        application.setDriverExperienceYears(driverExperienceYears);
        application.setHasAntiTheftSystem(hasAntiTheftSystem);
        application.setGarageParking(garageParking);
        application.setPreviousInsuranceNumber(previousInsuranceNumber);
        application.setDuration(getDuration());
        return application;
    }
} 