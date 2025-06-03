package com.strahovka.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.*;

@Data
public class OsagoApplicationRequest {
    // User fields (from form data)
    private String email;
    private String password; // Optional, can be derived by service
    private String firstName;
    private String lastName;
    private String middleName; // Optional
    private String phone;

    // Osago specific fields
    @NotBlank(message = "Car make is required")
    private String carMake;

    @NotBlank(message = "Car model is required")
    private String carModel;

    @NotNull(message = "Car year is required")
    @Min(value = 1900)
    private Integer carYear;

    @NotBlank(message = "VIN number is required")
    @Pattern(regexp = "^[A-HJ-NPR-Z0-9]{17}$", message = "Invalid VIN number format")
    private String vinNumber;

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotBlank(message = "Registration certificate is required")
    private String registrationCertificate;
    
    // Optional driver details if not unlimited
    private String driverLicenseNumber;
    private Integer driverExperienceYears;

    @NotNull(message = "Engine power is required")
    @Min(value = 1, message = "Engine power must be positive")
    private Integer enginePower;

    @NotBlank(message = "Region of registration is required")
    private String regionRegistration;

    private Boolean hasAccidentsLastYear;
    private String previousPolicyNumber;
    private Boolean isUnlimitedDrivers;

    @NotNull(message = "Duration in months is required")
    @Min(value = 1)
    private Integer duration; // Renamed from durationMonths for consistency
    
    private LocalDate startDate;
} 