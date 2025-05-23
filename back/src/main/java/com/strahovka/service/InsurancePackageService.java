package com.strahovka.service;

import com.strahovka.delivery.InsurancePackage;
import com.strahovka.repository.InsurancePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InsurancePackageService {
    private final InsurancePackageRepository packageRepository;

    public List<InsurancePackage> getAllActivePackages() {
        return packageRepository.findByActiveTrue();
    }

    public InsurancePackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
    }

    public InsurancePackage createPackage(InsurancePackage insurancePackage) {
        return packageRepository.save(insurancePackage);
    }

    public InsurancePackage updatePackage(Long id, InsurancePackage insurancePackage) {
        if (!packageRepository.existsById(id)) {
            throw new RuntimeException("Package not found");
        }
        insurancePackage.setId(id);
        return packageRepository.save(insurancePackage);
    }

    public void deletePackage(Long id) {
        if (!packageRepository.existsById(id)) {
            throw new RuntimeException("Package not found");
        }
        packageRepository.deleteById(id);
    }
} 