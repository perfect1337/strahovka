package com.strahovka.service;

import com.strahovka.delivery.InsuranceGuide;
import com.strahovka.repository.InsuranceGuideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InsuranceGuideService {

    @Autowired
    private InsuranceGuideRepository guideRepository;

    public List<InsuranceGuide> getAllGuides() {
        return guideRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<InsuranceGuide> getActiveGuides() {
        return guideRepository.findByActiveOrderByDisplayOrderAsc(true);
    }

    public Optional<InsuranceGuide> getGuideById(Long id) {
        return guideRepository.findById(id);
    }

    public Optional<InsuranceGuide> getGuideByInsuranceType(String insuranceType) {
        return guideRepository.findByInsuranceType(insuranceType);
    }

    @Transactional
    public InsuranceGuide createGuide(InsuranceGuide guide) {
        return guideRepository.save(guide);
    }

    @Transactional
    public Optional<InsuranceGuide> updateGuide(Long id, InsuranceGuide guideDetails) {
        return guideRepository.findById(id)
                .map(existingGuide -> {
                    existingGuide.setTitle(guideDetails.getTitle());
                    existingGuide.setDescription(guideDetails.getDescription());
                    existingGuide.setInsuranceType(guideDetails.getInsuranceType());
                    existingGuide.setImportantNotes(guideDetails.getImportantNotes());
                    existingGuide.setRequiredDocuments(guideDetails.getRequiredDocuments());
                    existingGuide.setCoverageDetails(guideDetails.getCoverageDetails());
                    existingGuide.setActive(guideDetails.isActive());
                    existingGuide.setDisplayOrder(guideDetails.getDisplayOrder());
                    return guideRepository.save(existingGuide);
                });
    }

    @Transactional
    public void deleteGuide(Long id) {
        guideRepository.deleteById(id);
    }

    @Transactional
    public Optional<InsuranceGuide> toggleGuideStatus(Long id) {
        return guideRepository.findById(id)
                .map(guide -> {
                    guide.setActive(!guide.isActive());
                    return guideRepository.save(guide);
                });
    }
} 