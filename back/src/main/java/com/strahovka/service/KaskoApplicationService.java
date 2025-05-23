package com.strahovka.service;

import com.strahovka.delivery.KaskoApplication;
import com.strahovka.delivery.User;
import com.strahovka.delivery.ApplicationStatus;
import com.strahovka.dto.KaskoApplicationRequest;
import com.strahovka.repository.KaskoApplicationRepository;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KaskoApplicationService {
    private final KaskoApplicationRepository kaskoApplicationRepository;
    private final UserRepository userRepository;

    @Transactional
    public KaskoApplication createApplication(KaskoApplicationRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        KaskoApplication application = new KaskoApplication();
        application.setUser(user);
        application.setCarMake(request.getCarMake());
        application.setCarModel(request.getCarModel());
        application.setCarYear(request.getCarYear());
        application.setVinNumber(request.getVinNumber());
        application.setLicensePlate(request.getLicensePlate());
        application.setCarValue(request.getCarValue());
        application.setDriverLicenseNumber(request.getDriverLicenseNumber());
        application.setDriverExperienceYears(request.getDriverExperienceYears());
        application.setHasAntiTheftSystem(request.getHasAntiTheftSystem());
        application.setGarageParking(request.getGarageParking());
        application.setPreviousInsuranceNumber(request.getPreviousInsuranceNumber());
        application.setApplicationDate(LocalDateTime.now());
        application.setStatus(ApplicationStatus.PENDING);

        return kaskoApplicationRepository.save(application);
    }

    @Transactional(readOnly = true)
    public List<KaskoApplication> getUserApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return kaskoApplicationRepository.findByUserOrderByApplicationDateDesc(user);
    }
} 