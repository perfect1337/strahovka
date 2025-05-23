package com.strahovka.delivery;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "osago_applications")
public class OsagoApplication extends BaseApplication {
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

    @Column(name = "driver_license_number", nullable = false)
    private String driverLicenseNumber;

    @Column(name = "driver_experience_years", nullable = false)
    private Integer driverExperienceYears;

    @Column(name = "engine_power", nullable = false)
    private Integer enginePower;

    @Column(name = "region_registration", nullable = false)
    private String regionRegistration;

    @Column(name = "has_accidents_last_year")
    private Boolean hasAccidentsLastYear;

    @Column(name = "previous_policy_number")
    private String previousPolicyNumber;
} 