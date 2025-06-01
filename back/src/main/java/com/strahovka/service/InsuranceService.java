package com.strahovka.service;

import com.strahovka.delivery.Claims.ClaimStatus;
import com.strahovka.delivery.Claims.InsuranceClaim;
import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private final InsuranceRepository insuranceRepository;
    private final ClaimsRepository claimsRepository;
    private final UserRepository userRepository;

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
    }

    // Guide operations
    @Transactional(readOnly = true)
    public List<InsuranceGuide> getAllGuides() {
        return insuranceRepository.findAllGuides();
    }

    @Transactional(readOnly = true)
    public InsuranceGuide getGuideById(Long id) {
        return insuranceRepository.findById(id)
                .map(policy -> policy.getGuide())
                .orElseThrow(() -> new EntityNotFoundException("Guide not found: " + id));
    }

    @Transactional
    public InsuranceGuide createGuide(InsuranceGuide guide) {
        guide.setCreatedAt(LocalDateTime.now());
        guide.setUpdatedAt(LocalDateTime.now());
        InsurancePolicy policy = new InsurancePolicy();
        policy.setGuide(guide);
        return insuranceRepository.save(policy).getGuide();
    }

    @Transactional
    public InsuranceGuide updateGuide(Long id, InsuranceGuide guide) {
        InsuranceGuide existingGuide = getGuideById(id);
        guide.setId(id);
        guide.setCreatedAt(existingGuide.getCreatedAt());
        guide.setUpdatedAt(LocalDateTime.now());
        InsurancePolicy policy = insuranceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Policy not found: " + id));
        policy.setGuide(guide);
        return insuranceRepository.save(policy).getGuide();
    }

    @Transactional
    public void deleteGuide(Long id) {
        insuranceRepository.deleteGuideById(id);
    }

    // Package operations
    @Transactional(readOnly = true)
    public List<InsurancePackage> getUserPackages(String usernameOrEmail) {
        return insuranceRepository.findPackagesByUsername(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<InsurancePackage> getPackagesByStatus(PackageStatus status) {
        return insuranceRepository.findPackagesByStatus(status);
    }

    @Transactional
    public InsurancePackage createPackage(InsurancePackage insurancePackage, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        insurancePackage.setUser(user);
        insurancePackage.setCreatedAt(LocalDateTime.now());
        return insuranceRepository.savePackage(insurancePackage);
    }

    @Transactional
    public InsurancePackage updatePackage(Long id, InsurancePackage insurancePackage) {
        insurancePackage.setId(id);
        insuranceRepository.updatePackage(insurancePackage);
        return insuranceRepository.findPackagesByUsername(insurancePackage.getUser().getEmail()).stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Package not found after update"));
    }

    @Transactional
    public void deletePackage(Long id) {
        insuranceRepository.deletePackageById(id);
    }

    // Category operations
    @Transactional(readOnly = true)
    public List<InsuranceCategory> getAllCategories() {
        return insuranceRepository.findAllCategories();
    }

    @Transactional
    public InsuranceCategory createCategory(InsuranceCategory category) {
        return insuranceRepository.saveCategory(category);
    }

    @Transactional
    public InsuranceCategory updateCategory(Long id, InsuranceCategory category) {
        category.setId(id);
        return insuranceRepository.saveCategory(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        insuranceRepository.deleteCategoryById(id);
    }

    // Policy operations
    @Transactional(readOnly = true)
    public List<InsurancePolicy> getUserPolicies(String usernameOrEmail) {
        return insuranceRepository.findPoliciesByUsername(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<InsurancePolicy> getPoliciesByStatus(PolicyStatus status) {
        return insuranceRepository.findPoliciesByStatus(status);
    }

    @Transactional
    public InsurancePolicy createPolicy(InsurancePolicy policy, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        policy.setUser(user);
        return insuranceRepository.save(policy);
    }

    @Transactional
    public InsurancePolicy updatePolicy(Long id, InsurancePolicy policy) {
        policy.setId(id);
        return insuranceRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        insuranceRepository.deleteById(id);
    }

    // Application operations
    @Transactional(readOnly = true)
    public List<KaskoApplication> getUserKaskoApplications(String usernameOrEmail) {
        return insuranceRepository.findKaskoApplicationsByUsername(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<OsagoApplication> getUserOsagoApplications(String usernameOrEmail) {
        return insuranceRepository.findOsagoApplicationsByUsername(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<PropertyApplication> getUserPropertyApplications(String usernameOrEmail) {
        return insuranceRepository.findPropertyApplicationsByUsername(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<HealthApplication> getUserHealthApplications(String usernameOrEmail) {
        return insuranceRepository.findHealthApplicationsByUsername(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<TravelApplication> getUserTravelApplications(String usernameOrEmail) {
        return insuranceRepository.findTravelApplicationsByUsername(usernameOrEmail);
    }

    @Transactional
    public void deleteApplication(Long id) {
        insuranceRepository.deleteApplicationById(id);
    }

    // Public methods
    public List<InsurancePackage> getPublicPackages() {
        return insuranceRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<InsurancePolicy> getAllPolicies() {
        return insuranceRepository.findAll();
    }

    // Claims methods
    @Transactional(readOnly = true)
    public List<InsuranceClaim> getUserClaims(String email, int page, int size) {
        User user = findUser(email);
        return claimsRepository.findByUser(user);
    }

    @Transactional
    public InsuranceClaim createClaim(InsuranceClaim claim, String email) {
        User user = findUser(email);
        claim.setUser(user);
        claim.setCreatedAt(LocalDateTime.now());
        claim.setStatus(ClaimStatus.PENDING);
        return claimsRepository.save(claim);
    }
} 