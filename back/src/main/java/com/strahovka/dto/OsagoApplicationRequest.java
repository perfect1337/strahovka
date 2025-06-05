package com.strahovka.dto;

import com.strahovka.delivery.Insurance.OsagoApplication;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class OsagoApplicationRequest extends BaseApplicationRequest {
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
    @Min(value = 1900, message = "Car year must be 1900 or later")
    @Max(value = 2025, message = "Car year cannot be in the future")
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

    public OsagoApplication toOsagoApplication() {
        OsagoApplication application = new OsagoApplication();
        application.setEmail(getEmail());
        application.setStartDate(getStartDate());
        application.setCarMake(carMake);
        application.setCarModel(carModel);
        application.setCarYear(carYear);
        application.setVinNumber(vinNumber);
        application.setLicensePlate(licensePlate);
        application.setRegistrationCertificate(registrationCertificate);
        application.setDriverLicenseNumber(driverLicenseNumber);
        application.setDriverExperienceYears(driverExperienceYears);
        application.setEnginePower(enginePower);
        application.setRegionRegistration(regionRegistration);
        application.setHasAccidentsLastYear(hasAccidentsLastYear);
        application.setPreviousPolicyNumber(previousPolicyNumber);
        application.setIsUnlimitedDrivers(isUnlimitedDrivers);
        application.setDuration(getDuration());
        return application;
    }
} 