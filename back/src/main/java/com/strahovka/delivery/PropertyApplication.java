package com.strahovka.delivery;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "property_applications")
public class PropertyApplication extends BaseApplication {
    @Column(name = "property_type", nullable = false)
    private String propertyType; // apartment, house, commercial

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name = "property_area", nullable = false, precision = 10, scale = 2)
    private BigDecimal propertyArea;

    @Column(name = "year_built", nullable = false)
    private Integer yearBuilt;

    @Column(name = "construction_type", nullable = false)
    private String constructionType;

    @Column(name = "property_value", nullable = false, precision = 10, scale = 2)
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