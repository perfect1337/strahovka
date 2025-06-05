package com.strahovka.delivery;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "kasko_applications")
@DiscriminatorValue("KASKO")
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class KaskoApplication extends Insurance.BaseApplication {

    @Column(name = "car_make")
    private String carBrand;

    @Column(name = "car_model")
    private String carModel;

    @Column(name = "car_year")
    private Integer carYear;

    @Column(name = "vin_number")
    private String carVin;

    @Column(name = "car_value", precision = 10, scale = 2)
    private BigDecimal carValue;

    @Column(name = "driver_experience_years")
    private Integer drivingExperienceYears;

    @Column(name = "license_plate", length = 20)
    private String licensePlate;

    @Column(name = "driver_license_number", length = 20)
    private String driverLicenseNumber;

    @Column(name = "has_anti_theft_system")
    private Boolean hasAntiTheftSystem;

    @Column(name = "garage_parking")
    private Boolean garageParking;

    @Column(name = "previous_insurance_number", length = 50)
    private String previousInsuranceNumber;

    @Column(name = "duration")
    private Integer duration;
} 