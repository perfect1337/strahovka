package com.strahovka.service;

import com.strahovka.delivery.*;
import com.strahovka.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class InsuranceApplicationService {
    private final KaskoApplicationRepository kaskoRepository;
    private final OsagoApplicationRepository osagoRepository;
    private final TravelApplicationRepository travelRepository;
    private final HealthApplicationRepository healthRepository;
    private final PropertyApplicationRepository propertyRepository;
    private final UserRepository userRepository;

    @Transactional
    public KaskoApplication createKaskoApplication(KaskoApplication application, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        validateKaskoApplication(application);

        application.setUser(user);
        application.setApplicationDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);

        return kaskoRepository.save(application);
    }

    private void validateKaskoApplication(KaskoApplication application) {
        if (application.getCarMake() == null || application.getCarMake().trim().isEmpty()) {
            throw new IllegalArgumentException("Car make is required");
        }
        if (application.getCarModel() == null || application.getCarModel().trim().isEmpty()) {
            throw new IllegalArgumentException("Car model is required");
        }
        if (application.getCarYear() == null || application.getCarYear() < 1900 || 
            application.getCarYear() > LocalDateTime.now().getYear() + 1) {
            throw new IllegalArgumentException("Invalid car year");
        }
        if (application.getVinNumber() == null || application.getVinNumber().trim().isEmpty() || 
            application.getVinNumber().length() != 17) {
            throw new IllegalArgumentException("Valid 17-character VIN number is required");
        }
        if (application.getDriverLicenseNumber() == null || application.getDriverLicenseNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Driver's license number is required");
        }
    }

    @Transactional
    public OsagoApplication createOsagoApplication(OsagoApplication application) {
        return osagoRepository.save(application);
    }

    @Transactional
    public TravelApplication createTravelApplication(TravelApplication application) {
        return travelRepository.save(application);
    }

    @Transactional
    public HealthApplication createHealthApplication(HealthApplication application) {
        return healthRepository.save(application);
    }

    @Transactional
    public PropertyApplication createPropertyApplication(PropertyApplication application) {
        return propertyRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<KaskoApplication> getKaskoApplications(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return kaskoRepository.findByUserId(user.getId());
    }

    @Transactional(readOnly = true)
    public KaskoApplication getKaskoApplication(Long id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return kaskoRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<OsagoApplication> getUserOsagoApplications(User user) {
        return osagoRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<TravelApplication> getUserTravelApplications(User user) {
        return travelRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<HealthApplication> getUserHealthApplications(User user) {
        return healthRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<PropertyApplication> getUserPropertyApplications(User user) {
        return propertyRepository.findByUserOrderByApplicationDateDesc(user);
    }

    public List<BaseApplication> getAllUserApplications(User user) {
        List<BaseApplication> allApplications = new ArrayList<>();
        allApplications.addAll(kaskoRepository.findByUserId(user.getId()));
        allApplications.addAll(getUserOsagoApplications(user));
        allApplications.addAll(getUserTravelApplications(user));
        allApplications.addAll(getUserHealthApplications(user));
        allApplications.addAll(getUserPropertyApplications(user));
        return allApplications;
    }
} 