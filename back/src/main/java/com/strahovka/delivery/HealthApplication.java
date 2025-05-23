package com.strahovka.delivery;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "health_applications")
public class HealthApplication extends BaseApplication {
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
} 