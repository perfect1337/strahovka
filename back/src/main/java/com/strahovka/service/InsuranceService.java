package com.strahovka.service;

import com.strahovka.entity.Claims;
import com.strahovka.entity.Claims.InsuranceClaim;
import com.strahovka.entity.Claims.ClaimAttachment;
import com.strahovka.entity.Insurance;
import com.strahovka.entity.Insurance.*;
import com.strahovka.entity.InsurancePolicy;
import com.strahovka.entity.User;
import com.strahovka.dto.ApplicationDetailDTO;
import com.strahovka.dto.UserPackageDetailDTO;
import com.strahovka.enums.Role;
import com.strahovka.enums.PackageStatus;
import com.strahovka.enums.PackageType;
import com.strahovka.enums.PolicyStatus;
import com.strahovka.enums.ClaimStatus;
import com.strahovka.enums.UserLevel;
import com.strahovka.repository.*;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.time.temporal.ChronoUnit;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.strahovka.dto.KaskoApplicationRequest;
import com.strahovka.dto.OsagoApplicationRequest;
import com.strahovka.dto.PackageApplicationItem;
import java.util.ArrayList;
import com.strahovka.entity.PackageApplicationLink;
import com.strahovka.repository.PackageApplicationLinkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private static final Logger log = LoggerFactory.getLogger(InsuranceService.class);

    private final InsuranceRepository insuranceRepository;
    private final ApplicationRepository applicationRepository;
    private final ClaimsRepository claimsRepository;
    private final UserRepository userRepository;
    private final InsuranceCategoryRepository insuranceCategoryRepository;
    private final InsurancePackageRepository insurancePackageRepository;
    private final PackageApplicationLinkRepository packageApplicationLinkRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;
    private final AuthService authService;

    @PersistenceContext
    private EntityManager entityManager;

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
    }

    private User findOrCreateUserForApplication(String email) {
        log.info("Finding or creating user for email: {}", email);
        User user = authService.createOrGetUserByEmail(email);
        log.info("User {} found/created for email: {}", user.getId(), email);
        return user;
    }

    private User findUserStrict(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + email));
    }

    private User determineUserForApplication(BaseApplication application, String emailFromAuth) {
        User applicationUser;
        String emailForLookup = application.getEmail();

        if (emailFromAuth != null) {
            log.info("Authenticated user: {}. Email in application DTO: {}", emailFromAuth, emailForLookup);
            User authenticatedUser = findUserStrict(emailFromAuth);

            if (emailForLookup != null && !emailForLookup.trim().isEmpty() && !emailForLookup.equalsIgnoreCase(emailFromAuth)) {
                log.warn("Authenticated user {} is creating an application with a different email in payload: {}. Using payload email for user context.", emailFromAuth, emailForLookup);
                applicationUser = findOrCreateUserForApplication(emailForLookup);
            } else {
                applicationUser = authenticatedUser;
                if (emailForLookup == null || emailForLookup.trim().isEmpty()) {
                    application.setEmail(authenticatedUser.getEmail()); 
                }
            }
        } else {
            if (emailForLookup == null || emailForLookup.trim().isEmpty()) {
                log.error("Email is required in the application payload for an unauthenticated user. Application ID (if any): {}", application.getId());
                throw new IllegalArgumentException("Email is required in the application payload for an unauthenticated user.");
            }
            log.info("Unauthenticated flow. Using email from payload: {} to find/create user.", emailForLookup);
            applicationUser = findOrCreateUserForApplication(emailForLookup);
        }
        
        if (applicationUser.getFirstName() == null || 
            applicationUser.getFirstName().isEmpty() || 
            (applicationUser.getEmail() != null && applicationUser.getFirstName().equals(applicationUser.getEmail().split("@")[0]))) {
            
            if (applicationUser.getEmail() != null) { 
                applicationUser.setFirstName(applicationUser.getEmail().split("@")[0]);
            }
            
            userRepository.save(applicationUser);
            log.info("Updated user {} profile with firstName: {}. Ensure lastName is handled if available from DTOs.", 
                     applicationUser.getId(), applicationUser.getFirstName());
        }
        return applicationUser;
    }

    // Guide operations
    @Transactional(readOnly = true)
    public List<InsuranceGuide> getAllGuides() {
        return insuranceRepository.findAllGuides();
    }

    @Transactional(readOnly = true)
    public InsuranceGuide getGuideById(Long policyIdHavingGuide) {
        return insuranceRepository.findById(policyIdHavingGuide)
                .map(InsurancePolicy::getGuide)
                .orElseThrow(() -> new EntityNotFoundException("Guide not found (via policy id: " + policyIdHavingGuide + ")"));
    }

    @Transactional
    public InsuranceGuide createGuide(InsuranceGuide guide) {
        guide.setCreatedAt(LocalDateTime.now());
        guide.setUpdatedAt(LocalDateTime.now());
        if (guide.getDisplayOrder() == null) {
            guide.setDisplayOrder(0);
        }
        setCalculationRulesForGuide(guide);

        StringBuilder content = new StringBuilder();
        if (guide.getDescription() != null) {
            content.append(guide.getDescription()).append("\n\n");
        }
        if (guide.getCalculationRules() != null) {
            content.append("Правила расчета:\n").append(guide.getCalculationRules());
        }
        guide.setContent(content.toString());

        InsuranceCategory category = insuranceCategoryRepository.findByName(guide.getInsuranceType())
            .orElseGet(() -> {
                InsuranceCategory newCategory = new InsuranceCategory();
                newCategory.setName(guide.getInsuranceType());
                newCategory.setDescription("Category for " + guide.getInsuranceType());
                newCategory.setBasePrice(BigDecimal.ZERO);
                newCategory.setType(guide.getInsuranceType());
                return insuranceCategoryRepository.save(newCategory);
            });
        
        InsuranceGuide savedGuide = entityManager.merge(guide);
        entityManager.flush();

        InsurancePolicy policy = new InsurancePolicy();
        policy.setName("Guide: " + savedGuide.getTitle());
        policy.setDescription(savedGuide.getDescription());
        policy.setPrice(BigDecimal.ZERO);
        policy.setStartDate(LocalDate.now());
        policy.setEndDate(LocalDate.now().plusYears(100));
        policy.setActive(true);
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setCategory(category);
        policy.setGuide(savedGuide);

        insuranceRepository.save(policy);
        
        return savedGuide;
    }

    @Transactional
    public InsuranceGuide updateGuide(Long policyIdHoldingGuide, InsuranceGuide guideUpdates) {
        InsurancePolicy existingPolicy = insuranceRepository.findById(policyIdHoldingGuide)
                .orElseThrow(() -> new EntityNotFoundException("Policy (and thus Guide) not found with id: " + policyIdHoldingGuide));

        InsuranceGuide existingGuide = existingPolicy.getGuide();
        if (existingGuide == null) {
            existingGuide = new InsuranceGuide();
            existingPolicy.setGuide(existingGuide);
        }
        
        existingGuide.setTitle(guideUpdates.getTitle());
        existingGuide.setDescription(guideUpdates.getDescription());
        existingGuide.setInsuranceType(guideUpdates.getInsuranceType());
        existingGuide.setImportantNotes(guideUpdates.getImportantNotes());
        existingGuide.setRequiredDocuments(guideUpdates.getRequiredDocuments());
        existingGuide.setCoverageDetails(guideUpdates.getCoverageDetails());
        existingGuide.setActive(guideUpdates.isActive());
        existingGuide.setDisplayOrder(guideUpdates.getDisplayOrder());
        existingGuide.setUpdatedAt(LocalDateTime.now());
        
        setCalculationRulesForGuide(existingGuide);

        insuranceRepository.save(existingPolicy);
        return existingGuide;
    }

    @Transactional
    public void deleteGuide(Long guideId) {
        insuranceRepository.deleteGuideById(guideId);
    }

    // Package operations
    @Transactional(readOnly = true)
    public List<InsurancePackage> getUserPackages(String usernameOrEmail) {
        return insurancePackageRepository.findByUserEmail(usernameOrEmail);
    }

    @Transactional(readOnly = true)
    public List<InsurancePackage> getPackagesByStatus(PackageStatus status) {
        return insurancePackageRepository.findByStatus(status);
    }

    @Transactional
    public InsurancePackage createPackage(InsurancePackage insurancePackage, String creatorUsernameOrEmail, List<Long> categoryIds) {
        User creator = findUser(creatorUsernameOrEmail);
        insurancePackage.setUser(creator);
        insurancePackage.setCreatedAt(LocalDateTime.now());
        if (insurancePackage.getStatus() == null) {
            insurancePackage.setStatus(PackageStatus.PENDING);
        }
        if (insurancePackage.getPackageType() == null) {
            insurancePackage.setPackageType(PackageType.CUSTOM);
        }
        insurancePackage.setActive(true);

        if (categoryIds != null && !categoryIds.isEmpty()) {
            List<InsuranceCategory> categories = insuranceCategoryRepository.findAllById(categoryIds);
            if (categories.size() != categoryIds.size()) {
                throw new EntityNotFoundException("One or more categories not found for the provided IDs when creating package.");
            }
            insurancePackage.setCategories(new HashSet<>(categories));
        } else {
            insurancePackage.setCategories(new HashSet<>());
        }
        return insurancePackageRepository.save(insurancePackage);
    }

    @Transactional
    public InsurancePackage updatePackage(Long packageId, InsurancePackage packageUpdates, List<Long> categoryIds) {
        InsurancePackage existingPackage = insurancePackageRepository.findById(packageId)
            .orElseThrow(() -> new EntityNotFoundException("Package not found with id: " + packageId));

        existingPackage.setName(packageUpdates.getName());
        existingPackage.setDescription(packageUpdates.getDescription());
        existingPackage.setBasePrice(packageUpdates.getBasePrice());
        existingPackage.setDiscount(packageUpdates.getDiscount());
        existingPackage.setActive(packageUpdates.isActive());
        existingPackage.setStatus(packageUpdates.getStatus());

        if (categoryIds != null) {
            if (categoryIds.isEmpty()) {
                existingPackage.getCategories().clear();
            } else {
                List<InsuranceCategory> categories = insuranceCategoryRepository.findAllById(categoryIds);
                 if (categories.size() != categoryIds.size()) {
                    throw new EntityNotFoundException("One or more categories not found for the provided IDs during package update.");
                }
                existingPackage.setCategories(new HashSet<>(categories));
            }
        }
        return insurancePackageRepository.save(existingPackage);
    }

    @Transactional
    public void deletePackage(Long id) {
        insurancePackageRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public InsurancePackage getPackageById(Long id) {
        return insurancePackageRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Package not found with id: " + id));
    }

    // Category operations
    @Transactional(readOnly = true)
    public List<InsuranceCategory> getAllCategories() {
        return insuranceCategoryRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public InsuranceCategory getCategoryById(Long id) {
        return insuranceCategoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
    }

    @Transactional
    public InsuranceCategory createCategory(InsuranceCategory category) {
        insuranceCategoryRepository.findByName(category.getName()).ifPresent(existing -> {
            throw new IllegalArgumentException("Category with name '" + category.getName() + "' already exists.");
        });
        return insuranceCategoryRepository.save(category);
    }

    @Transactional
    public InsuranceCategory updateCategory(Long id, InsuranceCategory categoryUpdates) {
        InsuranceCategory existingCategory = insuranceCategoryRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Category not found with id: " + id));
        
        if (categoryUpdates.getName() != null && !categoryUpdates.getName().equals(existingCategory.getName())) {
             insuranceCategoryRepository.findByName(categoryUpdates.getName()).ifPresent(conflicting -> {
                if (!conflicting.getId().equals(id)) {
                    throw new IllegalArgumentException("Another category with name '" + categoryUpdates.getName() + "' already exists.");
                }
            });
            existingCategory.setName(categoryUpdates.getName());
        }

        if(categoryUpdates.getDescription() != null) existingCategory.setDescription(categoryUpdates.getDescription());
        if(categoryUpdates.getBasePrice() != null) existingCategory.setBasePrice(categoryUpdates.getBasePrice());
        if(categoryUpdates.getType() != null) existingCategory.setType(categoryUpdates.getType());
        
        return insuranceCategoryRepository.save(existingCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {
        insuranceCategoryRepository.deleteById(id);
    }

    // Policy operations
    @Transactional
    public void recalculateUserPolicyCount(String username) {
        User user = findUser(username);
        long activeCount = insuranceRepository.countByUserAndStatusAndActive(user, PolicyStatus.ACTIVE, true);
        user.setPolicyCount((int) activeCount);
        user.setLevel(UserLevel.getLevelByPolicyCount(user.getPolicyCount()));
        userRepository.save(user);
        log.info("Recalculated policy count for user {}: {} active policies, new level: {}", username, activeCount, user.getLevel());
    }

    @Transactional(readOnly = true)
    public List<InsurancePolicy> getUserPolicies(String usernameOrEmail) {
        recalculateUserPolicyCount(usernameOrEmail);
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

        if (policy.getCategory() != null && policy.getCategory().getId() != null) {
            InsuranceCategory category = insuranceCategoryRepository.findById(policy.getCategory().getId())
                .orElseThrow(() -> new EntityNotFoundException("Category for policy (ID: " + policy.getCategory().getId() + ") not found."));
            policy.setCategory(category);
        } else if (policy.getCategory() != null && policy.getCategory().getName() != null) {
             InsuranceCategory category = insuranceCategoryRepository.findByName(policy.getCategory().getName())
                .orElseThrow(() -> new EntityNotFoundException("Category for policy (Name: " + policy.getCategory().getName() + ") not found."));
            policy.setCategory(category);
        } else {
            throw new IllegalArgumentException("Policy category must be specified by ID or Name.");
        }
        
        InsurancePolicy savedPolicy = insuranceRepository.save(policy);
        
        recalculateUserPolicyCount(usernameOrEmail);
        
        return savedPolicy;
    }

    @Transactional
    public InsurancePolicy updatePolicy(Long id, InsurancePolicy policyUpdates) {
        InsurancePolicy existingPolicy = insuranceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Policy not found with id: " + id));
        
        if (policyUpdates.getName() != null) existingPolicy.setName(policyUpdates.getName());
        if (policyUpdates.getDescription() != null) existingPolicy.setDescription(policyUpdates.getDescription());
        if (policyUpdates.getPrice() != null) existingPolicy.setPrice(policyUpdates.getPrice());
        if (policyUpdates.getStartDate() != null) existingPolicy.setStartDate(policyUpdates.getStartDate());
        if (policyUpdates.getEndDate() != null) existingPolicy.setEndDate(policyUpdates.getEndDate());
        if (policyUpdates.getStatus() != null) existingPolicy.setStatus(policyUpdates.getStatus());
        existingPolicy.setActive(policyUpdates.isActive());

        if (policyUpdates.getCategory() != null && policyUpdates.getCategory().getId() != null) {
            InsuranceCategory category = insuranceCategoryRepository.findById(policyUpdates.getCategory().getId())
                .orElseThrow(() -> new EntityNotFoundException("Category for policy update (ID: " + policyUpdates.getCategory().getId() + ") not found."));
            existingPolicy.setCategory(category);
        } else if (policyUpdates.getCategory() != null && policyUpdates.getCategory().getName() != null) {
            InsuranceCategory category = insuranceCategoryRepository.findByName(policyUpdates.getCategory().getName())
               .orElseThrow(() -> new EntityNotFoundException("Category for policy update (Name: " + policyUpdates.getCategory().getName() + ") not found."));
           existingPolicy.setCategory(category);
       }
        return insuranceRepository.save(existingPolicy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        insuranceRepository.deletePolicyById(id);
    }

    // Application operations
    private BigDecimal calculateKaskoPrice(KaskoApplication app) {
        if (app.getCarValue() == null) return BigDecimal.ZERO;
        BigDecimal basePrice = app.getCarValue().multiply(new BigDecimal("0.05"));
        BigDecimal calculatedPrice = basePrice;
        if (app.getCarYear() != null) {
            int carAge = LocalDate.now().getYear() - app.getCarYear();
            if (carAge > 10) calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.10")));
            else if (carAge > 5) calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.05")));
            }
        if (app.getDriverExperienceYears() != null) {
            if (app.getDriverExperienceYears() < 3) calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.15")));
            else if (app.getDriverExperienceYears() < 5) calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.07")));
            }
        if (Boolean.TRUE.equals(app.getHasAntiTheftSystem())) calculatedPrice = calculatedPrice.subtract(basePrice.multiply(new BigDecimal("0.05")));
        if (Boolean.TRUE.equals(app.getGarageParking())) calculatedPrice = calculatedPrice.subtract(basePrice.multiply(new BigDecimal("0.03")));
        if (app.getDuration() != null && app.getDuration() != 12) {
            calculatedPrice = calculatedPrice.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(app.getDuration()));
        }
        return calculatedPrice.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateOsagoPrice(OsagoApplication app) {
        if (app == null) return BigDecimal.ZERO;
        BigDecimal baseRate = new BigDecimal("4118.00");
        BigDecimal powerCoeff = new BigDecimal("1.0");
        if (app.getEnginePower() != null) {
            if (app.getEnginePower() <= 50) powerCoeff = new BigDecimal("0.6");
            else if (app.getEnginePower() <= 70) powerCoeff = new BigDecimal("1.0");
            else if (app.getEnginePower() <= 100) powerCoeff = new BigDecimal("1.1");
            else if (app.getEnginePower() <= 120) powerCoeff = new BigDecimal("1.2");
            else if (app.getEnginePower() <= 150) powerCoeff = new BigDecimal("1.4");
            else powerCoeff = new BigDecimal("1.6");
        }
        BigDecimal ageExperienceCoeff = new BigDecimal("1.87");
        if (app.getDriverExperienceYears() != null) { 
            if (app.getDriverExperienceYears() < 1) ageExperienceCoeff = new BigDecimal("1.93");
            else if (app.getDriverExperienceYears() < 2) ageExperienceCoeff = new BigDecimal("1.88");
            else if (app.getDriverExperienceYears() < 3) ageExperienceCoeff = new BigDecimal("1.72");
            else if (app.getDriverExperienceYears() < 5) ageExperienceCoeff = new BigDecimal("1.65");
            else if (app.getDriverExperienceYears() < 10) ageExperienceCoeff = new BigDecimal("1.62");
            else ageExperienceCoeff = new BigDecimal("1.60");
        }
        BigDecimal driversCoeff = Boolean.TRUE.equals(app.getIsUnlimitedDrivers()) ? new BigDecimal("2.32") : new BigDecimal("1.0");
        BigDecimal calculatedPrice = baseRate.multiply(powerCoeff).multiply(ageExperienceCoeff).multiply(driversCoeff);
        if (app.getDuration() != null && app.getDuration() != 12) {
            calculatedPrice = calculatedPrice.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(app.getDuration()));
        }
        return calculatedPrice.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public KaskoApplication createKaskoApplication(KaskoApplication application, String userEmailFromAuth) {
        User user = determineUserForApplication(application, userEmailFromAuth);
        application.setUser(user);
        application.setEmail(user.getEmail());
        application.setStatus("PENDING");
        application.setApplicationDate(LocalDateTime.now());
        application.setCalculatedAmount(calculateKaskoPrice(application));
        return applicationRepository.save(application);
    }

    @Transactional
    public Insurance.OsagoApplication createOsagoApplication(Insurance.OsagoApplication application, String userEmailFromAuth) {
        User user = determineUserForApplication(application, userEmailFromAuth);
        application.setUser(user);
        application.setEmail(user.getEmail());
        application.setStatus("PENDING");
        application.setApplicationDate(LocalDateTime.now());
        if (application.getDriverLicenseNumber() == null || application.getDriverLicenseNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Номер водительского удостоверения является обязательным полем");
        }
        application.setCalculatedAmount(calculateOsagoPrice(application));
        return applicationRepository.save(application);
    }

    @Transactional
    public Insurance.TravelApplication createTravelApplication(Insurance.TravelApplication application, String userEmailFromAuth) {
        User user = determineUserForApplication(application, userEmailFromAuth);
        application.setUser(user);
        application.setEmail(user.getEmail());
        application.setStatus("PENDING");
        application.setApplicationDate(LocalDateTime.now());
        if (application.getCalculatedAmount() == null) {
             application.setCalculatedAmount(new BigDecimal("2500.00"));
        }
        if (application.getTravelStartDate() == null) {
            application.setTravelStartDate(LocalDate.now().plusDays(7));
        }
        if (application.getTravelEndDate() == null && application.getTravelStartDate() != null) {
            application.setTravelEndDate(application.getTravelStartDate().plusDays(14));
        }
        application.setStartDate(application.getTravelStartDate());
        application.setEndDate(application.getTravelEndDate());
        return applicationRepository.save(application);
    }

    @Transactional
    public Insurance.HealthApplication createHealthApplication(Insurance.HealthApplication application, String userEmailFromAuth) {
        User user = determineUserForApplication(application, userEmailFromAuth);
        application.setUser(user);
        application.setEmail(user.getEmail());
        application.setStatus("PENDING");
        application.setApplicationDate(LocalDateTime.now());
        if (application.getCalculatedAmount() == null) {
            application.setCalculatedAmount(new BigDecimal("5000.00"));
        }
        if (application.getStartDate() == null) {
            application.setStartDate(LocalDate.now());
        }
        if (application.getEndDate() == null && application.getStartDate() != null) {
            application.setEndDate(application.getStartDate().plusYears(1));
        }
        return applicationRepository.save(application);
    }

    @Transactional
    public Insurance.PropertyApplication createPropertyApplication(Insurance.PropertyApplication application, String userEmailFromAuth) {
        User user = determineUserForApplication(application, userEmailFromAuth);
        application.setUser(user);
        application.setEmail(user.getEmail());
        application.setStatus("PENDING");
        application.setApplicationDate(LocalDateTime.now());
        if (application.getCalculatedAmount() == null) {
            if (application.getPropertyValue() != null && application.getPropertyValue().compareTo(BigDecimal.ZERO) > 0) {
                application.setCalculatedAmount(application.getPropertyValue().multiply(new BigDecimal("0.005")).setScale(2, RoundingMode.HALF_UP));
            } else {
                application.setCalculatedAmount(new BigDecimal("3000.00"));
            }
        }
        if (application.getStartDate() == null) {
            application.setStartDate(LocalDate.now());
        }
        if (application.getEndDate() == null && application.getStartDate() != null) {
            application.setEndDate(application.getStartDate().plusYears(1));
        }
        return applicationRepository.save(application);
    }

    // Payment Processing Logic
    private InsuranceCategory getOrCreateCategory(String displayNameRussian, String technicalTypeEnglish, String defaultDescription) {
        return insuranceCategoryRepository.findByNameAndType(displayNameRussian, technicalTypeEnglish)
            .orElseGet(() -> {
            InsuranceCategory newCategory = new InsuranceCategory();
            newCategory.setName(displayNameRussian);
            newCategory.setDescription(defaultDescription);
            newCategory.setBasePrice(BigDecimal.ZERO);
            newCategory.setType(technicalTypeEnglish);
            return insuranceCategoryRepository.save(newCategory);
        });
    }
    
    private InsurancePolicy setupPolicyFromApplication(BaseApplication application, User user, String policyName, String policyDescriptionPrefix, InsuranceCategory category) {
        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName(policyName); 
        policy.setDescription(policyDescriptionPrefix + application.getId());
        policy.setPrice(application.getCalculatedAmount());
        policy.setCategory(category);
        policy.setActive(true);
        policy.setStartDate(application.getStartDate() != null ? application.getStartDate() : LocalDate.now());

        LocalDate endDate = application.getEndDate();
        if (endDate == null) {
            Integer durationMonths = null;
            if (application instanceof KaskoApplication) durationMonths = ((KaskoApplication) application).getDuration();
            else if (application instanceof OsagoApplication) durationMonths = ((OsagoApplication) application).getDuration();
            endDate = policy.getStartDate().plusMonths(durationMonths != null ? durationMonths : 12);
        }
        if (application instanceof TravelApplication && ((TravelApplication) application).getTravelEndDate() != null) {
            endDate = ((TravelApplication) application).getTravelEndDate();
        }

        policy.setEndDate(endDate);
        policy.setStatus(PolicyStatus.ACTIVE);

        String appTypeDiscriminator = getApplicationTypeFromDiscriminator(application);
        if (appTypeDiscriminator != null && application.getId() != null) {
            packageApplicationLinkRepository.findByApplicationIdAndApplicationType(application.getId(), appTypeDiscriminator)
                .ifPresent(link -> {
                    insurancePackageRepository.findById(link.getPackageId()).ifPresent(pkg -> {
                        policy.setPackageName(pkg.getName());
                        policy.setPackageDiscount(pkg.getDiscount());
                    });
                });
        }
        
        InsurancePolicy savedPolicy = insuranceRepository.save(policy);
        recalculateUserPolicyCount(user.getEmail());
        return savedPolicy;
    }
    
    private <T extends BaseApplication> InsurancePolicy processGenericPayment(
        Long applicationId,
        String emailForUserContext, 
        Class<T> appClass,
        String categoryDisplayNameRussian,
        String categoryTechnicalTypeEnglish,
        String categoryDesc,
        java.util.function.Function<T, String> policyNameExtractor) {

        BaseApplication baseApplication = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new EntityNotFoundException("Application not found with id: " + applicationId));

        if (!appClass.isInstance(baseApplication)) {
            throw new EntityNotFoundException(appClass.getSimpleName() + " application found with id: " + applicationId + ", but it is of an unexpected type: " + baseApplication.getClass().getSimpleName());
        }
        T application = appClass.cast(baseApplication);

        User user = findOrCreateUserForApplication(emailForUserContext);
        
        if (application.getUser() == null || !application.getUser().getId().equals(user.getId())) {
            log.info("Updating user association for application {}: User ID {}", application.getId(), user.getId());
            application.setUser(user);
        }
        if (!user.getEmail().equalsIgnoreCase(application.getEmail())) {
             log.warn("User email {} for application {} differs from application's current email {}. Aligning application email.", 
                      user.getEmail(), application.getId(), application.getEmail());
             application.setEmail(user.getEmail());
        }

        InsuranceCategory category = getOrCreateCategory(categoryDisplayNameRussian, categoryTechnicalTypeEnglish, categoryDesc);
        String policyName = policyNameExtractor.apply(application);
        String policyDescription = "Полис автоматически создан из заявки #" + applicationId;
        InsurancePolicy policy = setupPolicyFromApplication(application, user, policyName, policyDescription, category);

        application.setStatus("PAID");
        applicationRepository.save(application);
        log.info("Application ID {} (type: {}) status updated to PAID after policy creation for user {}.", application.getId(), categoryTechnicalTypeEnglish, user.getEmail());

        return policy;
    }

    private String getEmailFromApplicationForProcessing(Long applicationId, String emailFromAuthController) {
        BaseApplication app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new EntityNotFoundException("Application not found for email extraction: " + applicationId));
        String emailFromAppRecord = app.getEmail();
        
        if (emailFromAppRecord != null && !emailFromAppRecord.trim().isEmpty()) {
            if (emailFromAuthController != null && !emailFromAppRecord.equalsIgnoreCase(emailFromAuthController)) {
                log.warn("Email in application record ({}) differs from authenticated user's email ({}). Prioritizing application record email for user context for application ID {}.", 
                         emailFromAppRecord, emailFromAuthController, applicationId);
            }
            return emailFromAppRecord;
        } else {
            log.warn("Email missing in application record for ID {}. Falling back to controller-provided/authenticated user's email: {}", applicationId, emailFromAuthController);
            if (emailFromAuthController == null || emailFromAuthController.trim().isEmpty()) {
                throw new IllegalArgumentException("Email is critically missing for processing application ID: " + applicationId);
            }
            return emailFromAuthController;
        }
    }

    @Transactional
    public InsurancePolicy processKaskoPayment(Long applicationId, String usernameOrEmailFromController) {
        String emailForUserContext = getEmailFromApplicationForProcessing(applicationId, usernameOrEmailFromController);
        InsurancePolicy policy = processGenericPayment(applicationId, emailForUserContext, KaskoApplication.class,
            "КАСКО", "AUTO", "Добровольное страхование автомобиля",
            kaskoApp -> "КАСКО Полис для " + kaskoApp.getCarMake() + " " + kaskoApp.getCarModel());
        insuranceRepository.save(policy);
        return policy;
    }

    @Transactional
    public InsurancePolicy processTravelPayment(Long applicationId, String usernameOrEmailFromController) {
        String emailForUserContext = getEmailFromApplicationForProcessing(applicationId, usernameOrEmailFromController);
        InsurancePolicy policy = processGenericPayment(applicationId, emailForUserContext, TravelApplication.class,
            "Путешествия", "TRAVEL", "Страхование для путешественников",
            travelApp -> "Полис Путешественника для " + travelApp.getDestinationCountry());
        insuranceRepository.save(policy);
        return policy;
    }

    @Transactional
    public InsurancePolicy processPropertyPayment(Long applicationId, String usernameOrEmailFromController) {
        String emailForUserContext = getEmailFromApplicationForProcessing(applicationId, usernameOrEmailFromController);
        InsurancePolicy policy = processGenericPayment(applicationId, emailForUserContext, PropertyApplication.class,
            "Недвижимость", "PROPERTY", "Страхование недвижимого имущества",
            propertyApp -> "Полис Имущества для " + propertyApp.getPropertyType());
        insuranceRepository.save(policy);
        return policy;
    }

    @Transactional
    public InsurancePolicy processOsagoPayment(Long applicationId, String usernameOrEmailFromController) {
        String emailForUserContext = getEmailFromApplicationForProcessing(applicationId, usernameOrEmailFromController);
        InsurancePolicy policy = processGenericPayment(applicationId, emailForUserContext, OsagoApplication.class,
            "ОСАГО", "AUTO", "Обязательное страхование автогражданской ответственности",
            osagoApp -> "ОСАГО Полис для " + osagoApp.getCarMake() + " " + osagoApp.getCarModel());
        insuranceRepository.save(policy);
        return policy;
    }

    @Transactional
    public InsurancePolicy processHealthPayment(Long applicationId, String usernameOrEmailFromController) {
        String emailForUserContext = getEmailFromApplicationForProcessing(applicationId, usernameOrEmailFromController);
        InsurancePolicy policy = processGenericPayment(applicationId, emailForUserContext, HealthApplication.class,
            "Здоровье", "HEALTH", "Добровольное медицинское страхование",
             healthApp -> {
                User policyUser = healthApp.getUser();
                if (policyUser != null && policyUser.getFirstName() != null && !policyUser.getFirstName().isEmpty()) {
                    return "Полис Здоровья для " + policyUser.getFirstName() + (policyUser.getLastName() != null ? " " + policyUser.getLastName() : "");
                } else if (policyUser != null && policyUser.getEmail() != null) {
                     return "Полис Здоровья для пользователя " + policyUser.getEmail();
                }
                return "Полис Здоровья";
            });
        insuranceRepository.save(policy);
        return policy;
    }

    // Retrieval methods for different application types
    @Transactional(readOnly = true)
    public List<KaskoApplication> getKaskoApplications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return applicationRepository.findKaskoApplicationsByUsername(user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<OsagoApplication> getOsagoApplications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return applicationRepository.findOsagoApplicationsByUsername(user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<PropertyApplication> getPropertyApplications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return applicationRepository.findPropertyApplicationsByUsername(user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<HealthApplication> getHealthApplications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return applicationRepository.findHealthApplicationsByUsername(user.getEmail());
    }

    @Transactional(readOnly = true)
    public List<TravelApplication> getTravelApplications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return applicationRepository.findTravelApplicationsByUsername(user.getEmail());
    }

    @Transactional
    public void deleteApplication(Long id) {
        applicationRepository.deleteById(id);
    }

    // Public access methods for packages and policies
    @Transactional(readOnly = true)
    public List<InsurancePackage> getPublicPackages() {
        return insurancePackageRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<InsurancePackage> getAllPackages() {
        return insurancePackageRepository.findAllWithCategories();
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
        if (claim.getPolicy() == null || claim.getPolicy().getId() == null) {
            throw new IllegalArgumentException("Claim must be associated with a valid policy ID.");
        }
        InsurancePolicy policy = insuranceRepository.findById(claim.getPolicy().getId())
            .orElseThrow(() -> new EntityNotFoundException("Policy for claim (ID: " + claim.getPolicy().getId() + ") not found."));
        claim.setPolicy(policy);
        return claimsRepository.save(claim);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<InsurancePolicy> findPolicyById(Long id) {
        return insuranceRepository.findById(id);
    }

    @Transactional
    public ClaimAttachment saveAttachment(ClaimAttachment attachment) {
        if (attachment.getClaim() == null || attachment.getClaim().getId() == null) {
            throw new IllegalArgumentException("Attachment must be associated with a claim ID.");
        }
        InsuranceClaim claim = claimsRepository.findById(attachment.getClaim().getId())
            .orElseThrow(() -> new EntityNotFoundException("Claim for attachment (ID: " + attachment.getClaim().getId() + ") not found."));
        attachment.setClaim(claim);
        entityManager.persist(attachment);
        entityManager.flush();
        return attachment;
    }

    @Transactional(readOnly = true)
    public List<Claims.ClaimMessage> getClaimMessages(Long claimId, String email) {
        User user = findUser(email);
        InsuranceClaim claim = claimsRepository.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found: " + claimId));
        
        if (!claim.getUser().equals(user) && !(user.getRole() == Role.ADMIN || user.getRole() == Role.MODERATOR)) {
            throw new SecurityException("User does not have access to this claim's messages.");
        }
        return claimsRepository.findMessagesByClaim(claimId);
    }

    @Transactional
    public Claims.ClaimMessage addClaimMessage(Long claimId, String messageContent, String email) {
        User user = findUser(email);
        InsuranceClaim claim = claimsRepository.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found: " + claimId));
        
        if (!claim.getUser().equals(user) && !(user.getRole() == Role.ADMIN || user.getRole() == Role.MODERATOR)) {
            throw new SecurityException("User does not have permission to add messages to this claim.");
        }
        
        Claims.ClaimMessage message = new Claims.ClaimMessage();
        message.setClaim(claim);
        message.setUser(user);
        message.setMessage(messageContent);
        message.setSentAt(LocalDateTime.now());
        entityManager.persist(message);
        entityManager.flush();
        return message;
    }

    @Transactional
    public InsuranceClaim cancelClaim(Long claimId, String username) {
        User user = findUser(username);
        InsuranceClaim claim = claimsRepository.findByIdAndUser(claimId, user)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found with id " + claimId + " for user " + username));

        ClaimStatus currentStatus = claim.getStatus();
        if (currentStatus == ClaimStatus.CANCELLED || currentStatus == ClaimStatus.APPROVED) {
            throw new IllegalStateException("Claim cannot be cancelled as it's already " + currentStatus);
        }
        claim.setStatus(ClaimStatus.CANCELLED);
        return claimsRepository.save(claim);
    }

    @Transactional
    public Map<String, Object> cancelPolicy(Long policyId, String username, String reason) {
        User user = findUser(username);
        InsurancePolicy policy = insuranceRepository.findByIdAndUser(policyId, user)
                .orElseThrow(() -> new EntityNotFoundException("Policy not found with id " + policyId + " for user " + username));

        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new IllegalStateException("Policy cannot be cancelled. Current status: " + policy.getStatus() + ". Policy must be ACTIVE.");
        }

        BigDecimal refundAmount = BigDecimal.ZERO;
        long daysSinceActivation = ChronoUnit.DAYS.between(policy.getStartDate(), LocalDate.now());
        if (daysSinceActivation < 0) daysSinceActivation = 0; 

        long totalPolicyDurationDays = ChronoUnit.DAYS.between(policy.getStartDate(), policy.getEndDate());
        if (totalPolicyDurationDays <= 0) throw new IllegalStateException("Policy duration is invalid.");

        if (daysSinceActivation <= 14) {
            refundAmount = policy.getPrice();
        } else {
            BigDecimal policyPrice = policy.getPrice();
            if (policyPrice == null) throw new IllegalStateException("Policy price is not set.");
            
            BigDecimal dailyRate = policyPrice.divide(BigDecimal.valueOf(totalPolicyDurationDays), 10, RoundingMode.HALF_UP);
            long remainingDays = totalPolicyDurationDays - daysSinceActivation;
            
            if (remainingDays > 0) {
                BigDecimal proRataRefund = dailyRate.multiply(BigDecimal.valueOf(remainingDays));
                BigDecimal adminFeePercentage = new BigDecimal("0.20");
                BigDecimal adminFee = proRataRefund.multiply(adminFeePercentage);
                refundAmount = proRataRefund.subtract(adminFee);
            }
        }

        refundAmount = refundAmount.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        policy.setStatus(PolicyStatus.CANCELLED);
        policy.setActive(false);
        policy.setCancellationReason(reason);
        policy.setCancelledAt(LocalDateTime.now());
        policy.setRefundAmount(refundAmount);
        insuranceRepository.save(policy);

        List<BaseApplication> relatedApplications = applicationRepository.findByPolicyId(policyId);
        for (BaseApplication app : relatedApplications) {
            app.setStatus("CANCELLED");
            applicationRepository.save(app);
            log.info("Updated status of related application ID {} to CANCELLED due to policy {} cancellation.", app.getId(), policyId);
        }

        recalculateUserPolicyCount(username);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Полис успешно отменен. Сумма возврата: " + refundAmount.toPlainString() + " ₽");
        result.put("refundAmount", refundAmount);
        return result;
    }

    private void setCalculationRulesForGuide(InsuranceGuide guide) {
        String type = guide.getInsuranceType();
        if ("KASKO".equalsIgnoreCase(type)) {
            guide.setCalculationRules(
                "Базовая ставка: 5% от стоимости автомобиля.\n" +
                "Год выпуска: +10% к базовой ставке, если авто старше 10 лет; +5%, если старше 5 лет.\n" +
                "Стаж вождения: +15% к базовой ставке, если стаж < 3 лет; +7%, если стаж < 5 лет.\n" +
                "Противоугонная система: -5% от базовой ставки.\n" +
                "Гаражное хранение: -3% от базовой ставки.\n" +
                "Длительность: Стоимость корректируется пропорционально сроку, если он не равен 12 месяцам."
            );
        } else if ("OSAGO".equalsIgnoreCase(type)) {
            guide.setCalculationRules(
                "Для ОСАГО расчет зависит от мощности двигателя, региона, стажа, КБМ и др. (Упрощенная логика будет добавлена позже)."
            );
        } else {
            guide.setCalculationRules("Правила расчета для данного типа страхования пока не определены.");
        }
    }

    @Transactional
    public InsurancePackage processPackageApplication(
            Long packageId,
            List<PackageApplicationItem> applicationItems,
            String authenticatedUserEmailIfAny) {

        InsurancePackage insurancePackage = insurancePackageRepository.findById(packageId)
                .orElseThrow(() -> new EntityNotFoundException("InsurancePackage not found with ID: " + packageId));

        if (applicationItems == null || applicationItems.isEmpty()) {
            throw new IllegalArgumentException("Application items list cannot be empty.");
        }

        PackageApplicationItem firstItem = applicationItems.get(0);
        Map<String, Object> firstItemData = firstItem.getData();
        String emailFromPayload = (String) firstItemData.get("email");

        if (emailFromPayload == null || emailFromPayload.trim().isEmpty()) {
            if (authenticatedUserEmailIfAny != null && !authenticatedUserEmailIfAny.trim().isEmpty()){
                log.warn("Email is missing in the first package application item's data. Using authenticated user's email: {} for package processing.", authenticatedUserEmailIfAny);
                emailFromPayload = authenticatedUserEmailIfAny;
            } else {
                throw new IllegalArgumentException("Email is required in the first application item's data for package processing, or user must be authenticated.");
            }
        }

        User packageUser;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String actualAuthenticatedEmail = (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof User) ?
                                           ((User)authentication.getPrincipal()).getEmail() : null;
        
        if (actualAuthenticatedEmail != null) {
            authenticatedUserEmailIfAny = actualAuthenticatedEmail;
        }

        if (authenticatedUserEmailIfAny != null) { 
            if (authenticatedUserEmailIfAny.equalsIgnoreCase(emailFromPayload)) {
                packageUser = findUserStrict(authenticatedUserEmailIfAny);
                log.info("Authenticated user {} is processing package for themself (email match).", authenticatedUserEmailIfAny);
            } else {
                log.warn("Authenticated user {} is processing package with a different email in payload: {}. Using payload email for user context.", authenticatedUserEmailIfAny, emailFromPayload);
                packageUser = findOrCreateUserForApplication(emailFromPayload);
            }
        } else { 
            log.info("Unauthenticated or mismatched email flow for package processing. Using email from payload: {} to find/create user.", emailFromPayload);
            packageUser = findOrCreateUserForApplication(emailFromPayload);
        }
        
        if (packageUser.getFirstName() == null || packageUser.getFirstName().isEmpty() || 
            (packageUser.getEmail() != null && packageUser.getFirstName().equals(packageUser.getEmail().split("@")[0]))) {
            String firstNameFromPayload = (String) firstItemData.get("firstName");
            if (firstNameFromPayload != null && !firstNameFromPayload.trim().isEmpty()) {
                packageUser.setFirstName(firstNameFromPayload);
            } else if (packageUser.getEmail() != null && (packageUser.getFirstName() == null || packageUser.getFirstName().isEmpty())) {
                 packageUser.setFirstName(packageUser.getEmail().split("@")[0]);
            }
        }
        String lastNameFromPayload = (String) firstItemData.get("lastName");
        if (lastNameFromPayload != null && !lastNameFromPayload.trim().isEmpty()) {
             if (!lastNameFromPayload.equals(packageUser.getLastName())) {
                packageUser.setLastName(lastNameFromPayload);
             }
        }
        String phoneFromPayload = (String) firstItemData.get("phone");
        if (phoneFromPayload != null && !phoneFromPayload.trim().isEmpty()) {
            if(!phoneFromPayload.equals(packageUser.getPhone())) {
                packageUser.setPhone(phoneFromPayload);
            }
        }
        if(packageUser.getFirstName() != null && !packageUser.getFirstName().isEmpty()) {
            userRepository.save(packageUser);
            log.info("Updated package user {} profile with data from payload. Name: {} {}, Phone: {}", 
                     packageUser.getId(), packageUser.getFirstName(), packageUser.getLastName(), packageUser.getPhone());
        }

        insurancePackage.setUser(packageUser);
        List<BaseApplication> createdApplications = new ArrayList<>();
        Set<String> selectedTypes = applicationItems.stream()
            .map(item -> {
                String type = item.getType();
                if (type == null || type.trim().isEmpty()) {
                    log.warn("Application item has no type specified: {}", item);
                    return "";
                }
                return type.toUpperCase();
            })
            .filter(type -> !type.isEmpty())
            .collect(Collectors.toSet());

        log.info("Selected insurance types in package: {}", selectedTypes);

        for (PackageApplicationItem item : applicationItems) {
            String itemType = item.getType();
            if (itemType == null || itemType.trim().isEmpty()) {
                log.warn("Skipping application item with no type specified");
                continue;
            }
            itemType = itemType.toUpperCase();
            
            if (!selectedTypes.contains(itemType)) {
                log.info("Skipping insurance type {} as it was not selected in package", itemType);
                continue;
            }

            log.info("Processing package item. Type: '{}', Data: {}", itemType, item.getData());

            BaseApplication newApplication = null;
            String actualApplicationTypeForLink = null;
            
            Map<String, Object> currentItemData = new HashMap<>(item.getData());
            currentItemData.put("email", packageUser.getEmail());

            switch(itemType) {
                case "KASKO":
                    KaskoApplicationRequest kaskoRequest = objectMapper.convertValue(currentItemData, KaskoApplicationRequest.class);
                    KaskoApplication kaskoApp = new KaskoApplication();
                    kaskoApp.setCarMake(kaskoRequest.getCarMake());
                    kaskoApp.setCarModel(kaskoRequest.getCarModel());
                    kaskoApp.setCarYear(kaskoRequest.getCarYear());
                    kaskoApp.setVinNumber(kaskoRequest.getVinNumber());
                    kaskoApp.setLicensePlate(kaskoRequest.getLicensePlate());
                    kaskoApp.setCarValue(kaskoRequest.getCarValue());
                    kaskoApp.setDriverLicenseNumber(kaskoRequest.getDriverLicenseNumber());
                    kaskoApp.setDriverExperienceYears(kaskoRequest.getDriverExperienceYears());
                    kaskoApp.setHasAntiTheftSystem(kaskoRequest.getHasAntiTheftSystem());
                    kaskoApp.setGarageParking(kaskoRequest.getGarageParking());
                    kaskoApp.setPreviousInsuranceNumber(kaskoRequest.getPreviousInsuranceNumber());
                    kaskoApp.setDuration(kaskoRequest.getDuration());
                    kaskoApp.setStartDate(kaskoRequest.getStartDate() != null ? kaskoRequest.getStartDate() : LocalDate.now());
                    
                    kaskoApp.setUser(packageUser);
                    kaskoApp.setEmail(packageUser.getEmail());
                    kaskoApp.setApplicationDate(LocalDateTime.now());
                    kaskoApp.setStatus("PENDING_PACKAGE");
                    kaskoApp.setCalculatedAmount(calculateKaskoPrice(kaskoApp));
                    if(kaskoApp.getEndDate() == null && kaskoApp.getDuration() != null && kaskoApp.getStartDate() != null) {
                        kaskoApp.setEndDate(kaskoApp.getStartDate().plusMonths(kaskoApp.getDuration()));
                    }
                    newApplication = applicationRepository.save(kaskoApp);
                    actualApplicationTypeForLink = "KASKO";
                    break;

                case "OSAGO":
                    OsagoApplicationRequest osagoRequest = objectMapper.convertValue(currentItemData, OsagoApplicationRequest.class);
                    OsagoApplication osagoApp = new OsagoApplication();
                    osagoApp.setCarMake(osagoRequest.getCarMake());
                    osagoApp.setCarModel(osagoRequest.getCarModel());
                    osagoApp.setCarYear(osagoRequest.getCarYear());
                    osagoApp.setVinNumber(osagoRequest.getVinNumber());
                    osagoApp.setLicensePlate(osagoRequest.getLicensePlate());
                    osagoApp.setRegistrationCertificate(osagoRequest.getRegistrationCertificate());
                    osagoApp.setDriverLicenseNumber(osagoRequest.getDriverLicenseNumber());
                    osagoApp.setDriverExperienceYears(osagoRequest.getDriverExperienceYears());
                    osagoApp.setEnginePower(osagoRequest.getEnginePower());
                    osagoApp.setRegionRegistration(osagoRequest.getRegionRegistration());
                    osagoApp.setHasAccidentsLastYear(osagoRequest.getHasAccidentsLastYear());
                    osagoApp.setPreviousPolicyNumber(osagoRequest.getPreviousPolicyNumber());
                    osagoApp.setIsUnlimitedDrivers(osagoRequest.getIsUnlimitedDrivers());
                    osagoApp.setDuration(osagoRequest.getDuration());
                    osagoApp.setStartDate(osagoRequest.getStartDate() != null ? osagoRequest.getStartDate() : LocalDate.now());

                    osagoApp.setUser(packageUser);
                    osagoApp.setEmail(packageUser.getEmail());
                    osagoApp.setApplicationDate(LocalDateTime.now());
                    osagoApp.setStatus("PENDING_PACKAGE");
                    osagoApp.setCalculatedAmount(calculateOsagoPrice(osagoApp));
                     if(osagoApp.getEndDate() == null && osagoApp.getDuration() != null && osagoApp.getStartDate() != null) {
                        osagoApp.setEndDate(osagoApp.getStartDate().plusMonths(osagoApp.getDuration()));
                    }
                    newApplication = applicationRepository.save(osagoApp);
                    actualApplicationTypeForLink = "OSAGO";
                    break;
                case "TRAVEL":
                    TravelApplication travelApp = objectMapper.convertValue(currentItemData, TravelApplication.class);
                    travelApp.setUser(packageUser);
                    travelApp.setEmail(packageUser.getEmail());
                    travelApp.setApplicationDate(LocalDateTime.now());
                    travelApp.setStatus("PENDING_PACKAGE");

                    if (travelApp.getCalculatedAmount() == null) {
                        travelApp.setCalculatedAmount(new BigDecimal("2500.00"));
                    }
                    if (travelApp.getTravelStartDate() == null) {
                        travelApp.setTravelStartDate(LocalDate.now().plusDays(7));
                    }
                    if (travelApp.getTravelEndDate() == null && travelApp.getTravelStartDate() != null) {
                        travelApp.setTravelEndDate(travelApp.getTravelStartDate().plusDays(14));
                    }
                    travelApp.setStartDate(travelApp.getTravelStartDate());
                    travelApp.setEndDate(travelApp.getTravelEndDate());

                    newApplication = applicationRepository.save(travelApp);
                    actualApplicationTypeForLink = "TRAVEL";
                    break;

                case "HEALTH":
                    HealthApplication healthApp = objectMapper.convertValue(currentItemData, HealthApplication.class);
                    healthApp.setUser(packageUser);
                    healthApp.setEmail(packageUser.getEmail());
                    healthApp.setApplicationDate(LocalDateTime.now());
                    healthApp.setStatus("PENDING_PACKAGE");

                    if (healthApp.getCalculatedAmount() == null) {
                        healthApp.setCalculatedAmount(new BigDecimal("5000.00"));
                    }
                    if (healthApp.getStartDate() == null) {
                        healthApp.setStartDate(LocalDate.now());
                    }
                    if (healthApp.getEndDate() == null && healthApp.getStartDate() != null) {
                        healthApp.setEndDate(healthApp.getStartDate().plusYears(1));
                    }
                    newApplication = applicationRepository.save(healthApp);
                    actualApplicationTypeForLink = "HEALTH";
                    break;

                case "PROPERTY":
                    PropertyApplication propertyApp = objectMapper.convertValue(currentItemData, PropertyApplication.class);
                    propertyApp.setUser(packageUser);
                    propertyApp.setEmail(packageUser.getEmail());
                    propertyApp.setApplicationDate(LocalDateTime.now());
                    propertyApp.setStatus("PENDING_PACKAGE");

                    if (propertyApp.getCalculatedAmount() == null) {
                        if (propertyApp.getPropertyValue() != null && propertyApp.getPropertyValue().compareTo(BigDecimal.ZERO) > 0) {
                            propertyApp.setCalculatedAmount(propertyApp.getPropertyValue().multiply(new BigDecimal("0.005")).setScale(2, RoundingMode.HALF_UP));
                        } else {
                            propertyApp.setCalculatedAmount(new BigDecimal("3000.00"));
                        }
                    }
                    if (propertyApp.getStartDate() == null) {
                        propertyApp.setStartDate(LocalDate.now());
                    }
                    if (propertyApp.getEndDate() == null && propertyApp.getStartDate() != null) {
                        propertyApp.setEndDate(propertyApp.getStartDate().plusYears(1));
                    }
                    newApplication = applicationRepository.save(propertyApp);
                    actualApplicationTypeForLink = "PROPERTY";
                    break;
                default:
                    log.warn("Unsupported insurance type: {}", itemType);
                    continue;
            }

            if (newApplication != null && actualApplicationTypeForLink != null) {
                createdApplications.add(newApplication);
                PackageApplicationLink link = PackageApplicationLink.builder()
                    .insurancePackage(insurancePackage)
                    .applicationId(newApplication.getId())
                    .applicationType(actualApplicationTypeForLink)
                    .build();
                link.setPackageId(insurancePackage.getId());
                insurancePackage.getApplicationLinks().add(link);
            }
        }
        
        BigDecimal totalPackageAmount = BigDecimal.ZERO;
        for(BaseApplication app : createdApplications) {
            if (app.getCalculatedAmount() != null) {
                totalPackageAmount = totalPackageAmount.add(app.getCalculatedAmount());
            }
        }
        insurancePackage.setOriginalTotalAmount(totalPackageAmount);
        BigDecimal discountAmount = totalPackageAmount.multiply(BigDecimal.valueOf(insurancePackage.getDiscount()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        insurancePackage.setFinalAmount(totalPackageAmount.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP));

        insurancePackage.setStatus(PackageStatus.PENDING);
        return insurancePackageRepository.save(insurancePackage);
    }

    private String getApplicationTypeFromDiscriminator(BaseApplication application) {
        DiscriminatorValue discriminatorValue = application.getClass().getAnnotation(DiscriminatorValue.class);
        return discriminatorValue != null ? discriminatorValue.value() : null;
    }

    @Transactional(readOnly = true)
    public List<UserPackageDetailDTO> getUserPackageDetails(String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        List<InsurancePackage> packages = insurancePackageRepository.findByUserEmail(user.getEmail());

        return packages.stream().map(pkg -> {
            List<ApplicationDetailDTO> applicationDetails = pkg.getApplicationLinks().stream()
                .map(link -> applicationRepository.findById(link.getApplicationId())
                    .map(app -> {
                        if (!app.getUser().getId().equals(user.getId())) {
                            log.warn("Data integrity issue: Package ID {} (user {}) contains link to Application ID {} (user {}) which belongs to a different user ({}). Skipping application.",
                                     pkg.getId(), user.getEmail(), app.getId(), app.getUser().getEmail(), app.getUser().getId());
                            return null;
                        }

                        String actualAppType = getApplicationTypeFromDiscriminator(app);

                        if (actualAppType == null || !link.getApplicationType().equals(actualAppType)) {
                            log.warn("Data integrity issue: Package ID {} for Application ID {} has link type '{}' but actual application type is '{}'. Using actual type: {}.",
                                     pkg.getId(), app.getId(), link.getApplicationType(), actualAppType, actualAppType);
                            if (actualAppType == null) {
                                log.error("Critical data issue: Could not determine actual application type for Application ID {}. Linked type was {}. Skipping.", app.getId(), link.getApplicationType());
                                return null;
                            }
                        }

                        log.info("Including application in package: AppID={}, DeterminedType={}, User={}, PackageID={}", 
                                 app.getId(), actualAppType, user.getEmail(), pkg.getId());
                        
                        String displayName = actualAppType != null ? actualAppType : "Тип не определен";

                        if (app instanceof KaskoApplication) {
                            KaskoApplication kaskoApp = (KaskoApplication) app;
                            String carMake = kaskoApp.getCarMake();
                            String carModel = kaskoApp.getCarModel();
                            if (carMake != null && !carMake.isEmpty() && carModel != null && !carModel.isEmpty()) {
                                displayName = "КАСКО: " + carMake + " " + carModel;
                            } else {
                                displayName = "КАСКО: (детали не указаны)";
                            }
                        } else if (app instanceof OsagoApplication) {
                            OsagoApplication osagoApp = (OsagoApplication) app;
                            String carMake = osagoApp.getCarMake();
                            String carModel = osagoApp.getCarModel();
                            if (carMake != null && !carMake.isEmpty() && carModel != null && !carModel.isEmpty()) {
                                displayName = "ОСАГО: " + carMake + " " + carModel;
                            } else {
                                displayName = "ОСАГО: (детали не указаны)";
                            }
                        } else if (app instanceof HealthApplication) {
                            HealthApplication healthApp = (HealthApplication) app;
                            String coverageType = healthApp.getCoverageType();
                            BigDecimal coverageAmount = healthApp.getCoverageAmount();
                            String amountStr = (coverageAmount != null) ? coverageAmount.toPlainString() : "N/A";
                            if (coverageType != null && !coverageType.isEmpty()) {
                                displayName = "Здоровье: " + coverageType + " (до " + amountStr + "\u20BD)";
                            } else {
                                displayName = "Здоровье: " + user.getFirstName() + " " + user.getLastName();
                            }
                        } else if (app instanceof TravelApplication) {
                            TravelApplication travelApp = (TravelApplication) app;
                            String destination = travelApp.getDestinationCountry();
                            String purpose = travelApp.getPurposeOfTrip();
                            if (destination != null && !destination.isEmpty() && purpose != null && !purpose.isEmpty()) {
                                displayName = "Путешествия: " + destination + " (" + purpose + ")";
                            } else if (destination != null && !destination.isEmpty()) {
                                displayName = "Путешествия: " + destination;
                            } else {
                                displayName = "Путешествия: (детали не указаны)";
                            }
                        } else if (app instanceof PropertyApplication) {
                            PropertyApplication propertyApp = (PropertyApplication) app;
                            String propertyType = propertyApp.getPropertyType();
                            String address = propertyApp.getAddress();
                            if (propertyType != null && !propertyType.isEmpty() && address != null && !address.isEmpty()) {
                                displayName = "Недвижимость: " + propertyType + " (" + address + ")";
                            } else if (propertyType != null && !propertyType.isEmpty()) {
                                displayName = "Недвижимость: " + propertyType;
                            } else {
                                displayName = "Недвижимость: (детали не указаны)";
                            }
                        }
                        
                        return ApplicationDetailDTO.builder()
                            .id(app.getId())
                            .applicationType(actualAppType)
                            .status(app.getStatus())
                            .startDate(app.getStartDate())
                            .endDate(app.getEndDate())
                            .calculatedAmount(app.getCalculatedAmount())
                            .displayName(displayName)
                            .build();
                    })
                    .orElseGet(() -> {
                        log.warn("Data integrity issue: Package ID {} contains link to non-existent Application ID {}. Type in link was {}.", 
                                 pkg.getId(), link.getApplicationId(), link.getApplicationType());
                        return null;
                    }))
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

            List<String> categoryNames = pkg.getCategories().stream()
                                            .map(InsuranceCategory::getName)
                                            .collect(Collectors.toList());

            return UserPackageDetailDTO.builder()
                .id(pkg.getId())
                .name(pkg.getName())
                .description(pkg.getDescription())
                .discount(pkg.getDiscount())
                .active(pkg.isActive())
                .originalTotalAmount(pkg.getOriginalTotalAmount())
                .finalAmount(pkg.getFinalAmount())
                .createdAt(pkg.getCreatedAt())
                .status(pkg.getStatus())
                .applicationsInPackage(applicationDetails)
                .categoryNames(categoryNames)
                .build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void processPackagePayment(Long packageId, String usernameOrEmailFromController) {
        User user = findUser(usernameOrEmailFromController);
        InsurancePackage insurancePackage = insurancePackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found with ID: " + packageId));

        if (!insurancePackage.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Package does not belong to the authenticated user.");
        }

        if (insurancePackage.getStatus() != PackageStatus.PENDING) { 
            throw new IllegalArgumentException("Package is not in a state that allows payment. Current status: " + insurancePackage.getStatus());
        }

        log.info("Processing payment for package ID: {}, User: {}", packageId, usernameOrEmailFromController);

        List<BaseApplication> applicationsToProcess = insurancePackage.getApplicationLinks().stream()
            .map(link -> applicationRepository.findById(link.getApplicationId())
                .orElseThrow(() -> new IllegalStateException("Application with ID " + link.getApplicationId() + " linked in package " + packageId + " not found.")))
            .collect(Collectors.toList());

        if (applicationsToProcess.isEmpty()) {
            log.warn("Package ID: {} has no applications to process. Marking as PAID.", packageId);
        }

        for (BaseApplication app : applicationsToProcess) {
            if (!app.getUser().getId().equals(user.getId())) {
                log.warn("Skipping application ID {} in package {} as it belongs to a different user ({}). This indicates a data integrity issue.", 
                         app.getId(), packageId, app.getUser().getEmail());
                continue;
            }

            String currentAppStatus = app.getStatus();
            if ("PAID".equals(currentAppStatus) || "ACTIVE".equals(currentAppStatus)) {
                log.info("Application ID {} in package {} is already paid or active. Skipping policy creation.", app.getId(), packageId);
                continue;
            }
            
            log.info("Processing application ID {} (type: {}) in package {}. Current status: {}", 
                     app.getId(), getApplicationTypeFromDiscriminator(app), packageId, app.getStatus());

            app.setStatus("PAID");
            applicationRepository.save(app);
            log.info("Application ID {} status updated to PAID.", app.getId());

            try {
                String policyName;
                String policyDescriptionPrefix;
                InsuranceCategory category;
                String appType = getApplicationTypeFromDiscriminator(app);

                if ("KASKO".equals(appType) && app instanceof KaskoApplication) {
                    KaskoApplication kaskoApp = (KaskoApplication) app;
                    policyName = "КАСКО Полис для " + kaskoApp.getCarMake() + " " + kaskoApp.getCarModel();
                    policyDescriptionPrefix = "Полис КАСКО (из пакета) для заявки #";
                    category = getOrCreateCategory("КАСКО", "AUTO", "Добровольное страхование автомобиля");
                } else if ("OSAGO".equals(appType) && app instanceof OsagoApplication) {
                    OsagoApplication osagoApp = (OsagoApplication) app;
                    policyName = "ОСАГО Полис для " + osagoApp.getCarMake() + " " + osagoApp.getCarModel();
                    policyDescriptionPrefix = "Полис ОСАГО (из пакета) для заявки #";
                    category = getOrCreateCategory("ОСАГО", "AUTO", "Обязательное страхование автогражданской ответственности");
                } else if ("TRAVEL".equals(appType) && app instanceof TravelApplication) {
                    TravelApplication travelApp = (TravelApplication) app;
                    policyName = "Полис Путешественника для " + travelApp.getDestinationCountry();
                    policyDescriptionPrefix = "Полис Путешественника (из пакета) для заявки #";
                    category = getOrCreateCategory("Путешествия", "TRAVEL", "Страхование для путешественников");
                } else if ("HEALTH".equals(appType) && app instanceof HealthApplication) {
                    policyName = "Полис Здоровья для " + user.getFirstName() + " " + user.getLastName();
                    policyDescriptionPrefix = "Полис Здоровья (из пакета) для заявки #";
                    category = getOrCreateCategory("Здоровье", "HEALTH", "Добровольное медицинское страхование");
                } else if ("PROPERTY".equals(appType) && app instanceof PropertyApplication) {
                    PropertyApplication propApp = (PropertyApplication) app;
                    policyName = "Полис Имущества для " + propApp.getPropertyType();
                    policyDescriptionPrefix = "Полис Имущества (из пакета) для заявки #";
                    category = getOrCreateCategory("Недвижимость", "PROPERTY", "Страхование недвижимого имущества");
                } else {
                    log.warn("Unsupported application type '{}' for policy creation in package {}. Skipping policy creation for app ID {}.", appType, packageId, app.getId());
                    continue;
                }

                InsurancePolicy createdPolicy = setupPolicyFromApplication(app, user, policyName, policyDescriptionPrefix, category);
                insuranceRepository.save(createdPolicy);
                log.info("Policy ID {} created for application ID {} in package {}.", createdPolicy.getId(), app.getId(), packageId);

            } catch (Exception e) {
                log.error("Error creating policy for application ID {} in package {}: {}", app.getId(), packageId, e.getMessage(), e);
            }
        }

        insurancePackage.setStatus(PackageStatus.COMPLETED);
        insurancePackageRepository.save(insurancePackage);
        log.info("Package ID {} status updated to PAID (now COMPLETED). Payment processing complete.", packageId);
    }

    @Transactional
    public InsurancePackage cancelPackage(Long packageId, String username) {
        User user = findUser(username);
        InsurancePackage insurancePackage = insurancePackageRepository.findById(packageId)
                .orElseThrow(() -> new EntityNotFoundException("Package not found with id: " + packageId));

        if (!insurancePackage.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("User is not authorized to cancel this package");
        }

        if (insurancePackage.getStatus() == PackageStatus.CANCELLED) {
            throw new IllegalStateException("Package is already cancelled");
        }
        if (insurancePackage.getStatus() == PackageStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed package. Please cancel individual policies instead.");
        }

        if (insurancePackage.getApplicationLinks() != null) {
            for (PackageApplicationLink link : insurancePackage.getApplicationLinks()) {
                BaseApplication application = applicationRepository.findById(link.getApplicationId())
                    .orElse(null);
                if (application != null && 
                    ("PENDING".equals(application.getStatus()) || 
                     "PENDING_PAYMENT".equals(application.getStatus()))) {
                    application.setStatus("CANCELLED");
                    applicationRepository.save(application);
                }
            }
        }

        insurancePackage.setStatus(PackageStatus.CANCELLED);
        return insurancePackageRepository.save(insurancePackage);
    }
} 