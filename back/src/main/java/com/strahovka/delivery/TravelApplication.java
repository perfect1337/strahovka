package com.strahovka.delivery;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "travel_applications")
public class TravelApplication extends BaseApplication {
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