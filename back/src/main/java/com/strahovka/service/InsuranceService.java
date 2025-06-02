package com.strahovka.service;

import com.strahovka.delivery.Claims;
import com.strahovka.delivery.Claims.InsuranceClaim;
import com.strahovka.delivery.Claims.ClaimAttachment;
import com.strahovka.delivery.Insurance;
import com.strahovka.delivery.Insurance.*;
import com.strahovka.delivery.InsurancePolicy;
import com.strahovka.delivery.User;
import com.strahovka.delivery.Role;
import com.strahovka.repository.*;
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
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InsuranceService {

    private final InsuranceRepository insuranceRepository;
    private final ApplicationRepository applicationRepository;
    private final ClaimsRepository claimsRepository;
    private final UserRepository userRepository;
    @PersistenceContext
    private EntityManager entityManager;

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
        setCalculationRulesForGuide(guide);
        InsurancePolicy policy = new InsurancePolicy();
        policy.setGuide(guide);
        InsurancePolicy savedPolicy = insuranceRepository.save(policy);
        return savedPolicy.getGuide();
    }

    @Transactional
    public InsuranceGuide updateGuide(Long id, InsuranceGuide guideUpdates) {
        InsurancePolicy existingPolicy = insuranceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Policy (and thus Guide) not found with id: " + id));

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
        insuranceRepository.saveCategory(category);
        return category;
    }

    @Transactional
    public InsuranceCategory updateCategory(Long id, InsuranceCategory category) {
        category.setId(id);
        insuranceRepository.saveCategory(category);
        return category;
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
    private BigDecimal calculateKaskoPrice(KaskoApplication app) {
        if (app.getCarValue() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal basePrice = app.getCarValue().multiply(new BigDecimal("0.05"));
        BigDecimal calculatedPrice = basePrice;

        if (app.getCarYear() != null) {
            int carAge = LocalDate.now().getYear() - app.getCarYear();
            if (carAge > 10) {
                calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.10")));
            } else if (carAge > 5) {
                calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.05")));
            }
        }

        if (app.getDriverExperienceYears() != null) {
            if (app.getDriverExperienceYears() < 3) {
                calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.15")));
            } else if (app.getDriverExperienceYears() < 5) {
                calculatedPrice = calculatedPrice.add(basePrice.multiply(new BigDecimal("0.07")));
            }
        }

        if (Boolean.TRUE.equals(app.getHasAntiTheftSystem())) {
            calculatedPrice = calculatedPrice.subtract(basePrice.multiply(new BigDecimal("0.05")));
        }

        if (Boolean.TRUE.equals(app.getGarageParking())) {
            calculatedPrice = calculatedPrice.subtract(basePrice.multiply(new BigDecimal("0.03")));
        }
        
        if (app.getDuration() != null && app.getDuration() != 12) {
            calculatedPrice = calculatedPrice.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                                           .multiply(BigDecimal.valueOf(app.getDuration()));
        }

        return calculatedPrice.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateOsagoPrice(OsagoApplication app) {
        if (app == null) {
            return BigDecimal.ZERO;
        }

        // 1. Базовая ставка (условное значение)
        BigDecimal baseRate = new BigDecimal("4118.00"); // Пример, может сильно отличаться

        // 2. Коэффициент мощности (КМ) - упрощенный пример
        BigDecimal powerCoeff = new BigDecimal("1.0");
        if (app.getEnginePower() != null) {
            if (app.getEnginePower() <= 50) powerCoeff = new BigDecimal("0.6");
            else if (app.getEnginePower() <= 70) powerCoeff = new BigDecimal("1.0");
            else if (app.getEnginePower() <= 100) powerCoeff = new BigDecimal("1.1");
            else if (app.getEnginePower() <= 120) powerCoeff = new BigDecimal("1.2");
            else if (app.getEnginePower() <= 150) powerCoeff = new BigDecimal("1.4");
            else powerCoeff = new BigDecimal("1.6");
        }

        // 3. Коэффициент возраста и стажа (КВС) - упрощенный пример
        BigDecimal ageExperienceCoeff = new BigDecimal("1.87"); // Дефолтный, если данные неполные
        if (app.getDriverExperienceYears() != null) { 
            if (app.getDriverExperienceYears() < 1) ageExperienceCoeff = new BigDecimal("1.93");
            else if (app.getDriverExperienceYears() < 2) ageExperienceCoeff = new BigDecimal("1.88");
            else if (app.getDriverExperienceYears() < 3) ageExperienceCoeff = new BigDecimal("1.72");
            else if (app.getDriverExperienceYears() < 5) ageExperienceCoeff = new BigDecimal("1.65");
            else if (app.getDriverExperienceYears() < 10) ageExperienceCoeff = new BigDecimal("1.62");
            else ageExperienceCoeff = new BigDecimal("1.60");
        }

        // 4. Коэффициент количества водителей (КО)
        BigDecimal driversCoeff = new BigDecimal("1.0"); 
        if (Boolean.TRUE.equals(app.getIsUnlimitedDrivers())) {
            driversCoeff = new BigDecimal("2.32"); 
        }
        
        BigDecimal calculatedPrice = baseRate
                .multiply(powerCoeff)
                .multiply(ageExperienceCoeff)
                .multiply(driversCoeff);

        if (app.getDuration() != null && app.getDuration() != 12) {
            calculatedPrice = calculatedPrice.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP)
                                           .multiply(BigDecimal.valueOf(app.getDuration()));
        }
        
        return calculatedPrice.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public KaskoApplication createKaskoApplication(KaskoApplication kaskoApplication, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        kaskoApplication.setUser(user);
        kaskoApplication.setApplicationDate(LocalDateTime.now());
        kaskoApplication.setStatus("PENDING");

        LocalDate startDate = LocalDate.now();
        kaskoApplication.setStartDate(startDate);
        if (kaskoApplication.getDuration() != null) {
            kaskoApplication.setEndDate(startDate.plusMonths(kaskoApplication.getDuration()));
        }
        
        kaskoApplication.setCalculatedAmount(calculateKaskoPrice(kaskoApplication));

        return applicationRepository.save(kaskoApplication);
    }

    @Transactional
    public OsagoApplication createOsagoApplication(OsagoApplication osagoApplication, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        osagoApplication.setUser(user);
        osagoApplication.setApplicationDate(LocalDateTime.now());
        osagoApplication.setStatus("PENDING");

        if (osagoApplication.getStartDate() == null) {
            osagoApplication.setStartDate(LocalDate.now());
        }
        if (osagoApplication.getDuration() != null && osagoApplication.getStartDate() != null) {
            osagoApplication.setEndDate(osagoApplication.getStartDate().plusMonths(osagoApplication.getDuration()));
        }
        
        osagoApplication.setCalculatedAmount(calculateOsagoPrice(osagoApplication));

        return applicationRepository.save(osagoApplication);
    }

    @Transactional
    public TravelApplication createTravelApplication(TravelApplication travelApplication, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        travelApplication.setUser(user);
        travelApplication.setApplicationDate(LocalDateTime.now()); // Устанавливаем текущую дату заявки
        travelApplication.setStatus("PENDING"); // Начальный статус

        // Расчет стоимости (если есть)
        // travelApplication.setCalculatedAmount(calculateTravelPrice(travelApplication));
        // TODO: Реализовать calculateTravelPrice, если он нужен, или установить сумму из запроса/по умолчанию
        // Пример установки фиксированной суммы для простоты, если расчет сложный или не требуется на этом этапе
        if (travelApplication.getCalculatedAmount() == null) {
            travelApplication.setCalculatedAmount(new BigDecimal("2500.00")); // Примерная сумма
        }

        // Установка дат начала и окончания, если они не переданы явно
        if (travelApplication.getTravelStartDate() == null) {
            travelApplication.setTravelStartDate(LocalDate.now().plusDays(7)); // Например, через неделю
        }
        if (travelApplication.getTravelEndDate() == null && travelApplication.getTravelStartDate() != null) {
            // Предположим, стандартная длительность поездки - 14 дней, если не указано иное
            travelApplication.setTravelEndDate(travelApplication.getTravelStartDate().plusDays(14));
        }
        // Убедимся, что startDate и endDate в BaseApplication также установлены
        travelApplication.setStartDate(travelApplication.getTravelStartDate());
        travelApplication.setEndDate(travelApplication.getTravelEndDate());

        return applicationRepository.save(travelApplication);
    }

    @Transactional
    public HealthApplication createHealthApplication(HealthApplication healthApplication, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        healthApplication.setUser(user);
        healthApplication.setApplicationDate(LocalDateTime.now());
        healthApplication.setStatus("PENDING");

        // TODO: Реализовать расчет стоимости для HealthApplication, если необходимо
        if (healthApplication.getCalculatedAmount() == null) {
            healthApplication.setCalculatedAmount(new BigDecimal("5000.00")); // Примерная сумма
        }
        
        // Установка дат начала и окончания (если применимо для здоровья, обычно на год)
        if (healthApplication.getStartDate() == null) {
            healthApplication.setStartDate(LocalDate.now());
        }
        if (healthApplication.getEndDate() == null && healthApplication.getStartDate() != null) {
            healthApplication.setEndDate(healthApplication.getStartDate().plusYears(1));
        }

        return applicationRepository.save(healthApplication);
    }

    @Transactional
    public PropertyApplication createPropertyApplication(PropertyApplication propertyApplication, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        propertyApplication.setUser(user);
        propertyApplication.setApplicationDate(LocalDateTime.now());
        propertyApplication.setStatus("PENDING");

        // TODO: Реализовать расчет стоимости для PropertyApplication, если необходимо
        if (propertyApplication.getCalculatedAmount() == null) {
            // Пример расчета, если есть стоимость объекта и базовый процент
            if (propertyApplication.getPropertyValue() != null) {
                propertyApplication.setCalculatedAmount(
                    propertyApplication.getPropertyValue().multiply(new BigDecimal("0.005")) // Например, 0.5% от стоимости
                        .setScale(2, RoundingMode.HALF_UP)
                );
            } else {
                propertyApplication.setCalculatedAmount(new BigDecimal("3000.00")); // Фиксированная сумма, если стоимость неизвестна
            }
        }

        // Установка дат начала и окончания (обычно на год для недвижимости)
        if (propertyApplication.getStartDate() == null) {
            propertyApplication.setStartDate(LocalDate.now());
        }
        if (propertyApplication.getEndDate() == null && propertyApplication.getStartDate() != null) {
            propertyApplication.setEndDate(propertyApplication.getStartDate().plusYears(1));
        }

        return applicationRepository.save(propertyApplication);
    }

    @Transactional
    public InsurancePolicy processKaskoPayment(Long applicationId, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        KaskoApplication application = applicationRepository.findById(applicationId)
                .filter(app -> app instanceof KaskoApplication && app.getUser().equals(user))
                .map(app -> (KaskoApplication) app)
                .orElseThrow(() -> new EntityNotFoundException("KaskoApplication not found with id " + applicationId + " for user " + usernameOrEmail));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Application is not in PENDING status, cannot process payment. Current status: " + application.getStatus());
        }

        // Пытаемся найти категорию "KASKO" или создаем временную, если не найдена.
        Insurance.InsuranceCategory kaskoCategory = insuranceRepository.findCategoryByName("KASKO");
        if (kaskoCategory == null) {
            // Это временное решение. Категории должны существовать.
            kaskoCategory = new Insurance.InsuranceCategory();
            kaskoCategory.setName("KASKO");
            kaskoCategory.setDescription("Стандартная категория КАСКО");
            kaskoCategory.setBasePrice(BigDecimal.ZERO); // Установите базовую цену, если необходимо
            kaskoCategory.setType("AUTO");
            // Save the category
            insuranceRepository.saveCategory(kaskoCategory);
            // After saving, find the category to get the persisted instance
            kaskoCategory = insuranceRepository.findCategoryByName("KASKO");
        }

        // Create and set up the policy with the saved category
        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName("КАСКО Полис для " + application.getCarMake() + " " + application.getCarModel());
        policy.setDescription("Полис КАСКО, сформированный на основе заявки #" + application.getId());
        policy.setPrice(application.getCalculatedAmount());
        policy.setCategory(kaskoCategory);
        policy.setActive(true);
        policy.setStartDate(application.getStartDate() != null ? application.getStartDate() : LocalDate.now());
        if (application.getEndDate() != null) {
            policy.setEndDate(application.getEndDate());
        } else if (application.getDuration() != null) {
            policy.setEndDate(policy.getStartDate().plusMonths(application.getDuration()));
        } else {
            policy.setEndDate(policy.getStartDate().plusYears(1)); // По умолчанию на год, если нет длительности
        }
        policy.setStatus(Insurance.PolicyStatus.ACTIVE); // Статус полиса - АКТИВЕН
        // Связываем полис с заявкой (если нужно)
        // application.setPolicy(policy); // Раскомментировать, если в BaseApplication есть поле policy и связь настроена

        InsurancePolicy savedPolicy = insuranceRepository.save(policy);

        // Обновляем статус заявки
        application.setStatus("ACTIVE"); // Или "COMPLETED", или другой соответствующий статус
        application.setPolicy(savedPolicy);
        application.setProcessedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return savedPolicy;
    }

    @Transactional
    public InsurancePolicy processTravelPayment(Long applicationId, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        TravelApplication application = applicationRepository.findById(applicationId)
                .filter(app -> app instanceof TravelApplication && app.getUser().equals(user))
                .map(app -> (TravelApplication) app)
                .orElseThrow(() -> new EntityNotFoundException("TravelApplication not found with id " + applicationId + " for user " + usernameOrEmail));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Application is not in PENDING status, cannot process payment. Current status: " + application.getStatus());
        }

        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName("Полис Путешественника для " + application.getDestinationCountry());
        policy.setDescription("Полис для путешествий, сформированный на основе заявки #" + application.getId());
        policy.setPrice(application.getCalculatedAmount());

        Insurance.InsuranceCategory travelCategory = insuranceRepository.findCategoryByName("TRAVEL");
        if (travelCategory == null) {
            travelCategory = new Insurance.InsuranceCategory();
            travelCategory.setName("TRAVEL");
            travelCategory.setDescription("Стандартная категория TRAVEL");
            travelCategory.setBasePrice(BigDecimal.ZERO);
            travelCategory.setType("TRAVEL");
            insuranceRepository.saveCategory(travelCategory); // Ensure new category is saved
            travelCategory = insuranceRepository.findCategoryByName("TRAVEL"); // Re-fetch the category
        }
        policy.setCategory(travelCategory);

        policy.setActive(true);
        policy.setStartDate(application.getTravelStartDate() != null ? application.getTravelStartDate() : LocalDate.now());
        if (application.getTravelEndDate() != null) {
            policy.setEndDate(application.getTravelEndDate());
        } else {
            policy.setEndDate(policy.getStartDate().plusDays(14)); // Default to 2 weeks if not specified
        }
        policy.setStatus(Insurance.PolicyStatus.ACTIVE);

        InsurancePolicy savedPolicy = insuranceRepository.save(policy);

        application.setStatus("ACTIVE");
        application.setPolicy(savedPolicy);
        application.setProcessedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return savedPolicy;
    }

    @Transactional
    public InsurancePolicy processPropertyPayment(Long applicationId, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        PropertyApplication application = applicationRepository.findById(applicationId)
                .filter(app -> app instanceof PropertyApplication && app.getUser().equals(user))
                .map(app -> (PropertyApplication) app)
                .orElseThrow(() -> new EntityNotFoundException("PropertyApplication not found with id " + applicationId + " for user " + usernameOrEmail));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Application is not in PENDING status, cannot process payment. Current status: " + application.getStatus());
        }

        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName("Полис Имущества для " + application.getPropertyType());
        policy.setDescription("Полис для имущества, сформированный на основе заявки #" + application.getId());
        policy.setPrice(application.getCalculatedAmount());

        Insurance.InsuranceCategory propertyCategory = insuranceRepository.findCategoryByName("PROPERTY");
        if (propertyCategory == null) {
            propertyCategory = new Insurance.InsuranceCategory();
            propertyCategory.setName("PROPERTY");
            propertyCategory.setDescription("Стандартная категория PROPERTY");
            propertyCategory.setBasePrice(BigDecimal.ZERO);
            propertyCategory.setType("PROPERTY");
            insuranceRepository.saveCategory(propertyCategory); // Ensure new category is saved
            propertyCategory = insuranceRepository.findCategoryByName("PROPERTY"); // Re-fetch the category
        }
        policy.setCategory(propertyCategory);

        policy.setActive(true);
        policy.setStartDate(application.getStartDate() != null ? application.getStartDate() : LocalDate.now());
        // Assuming property insurance is typically for a year if not specified otherwise
        policy.setEndDate(policy.getStartDate().plusYears(1)); 
        policy.setStatus(Insurance.PolicyStatus.ACTIVE);

        InsurancePolicy savedPolicy = insuranceRepository.save(policy);

        application.setStatus("ACTIVE");
        application.setPolicy(savedPolicy);
        application.setProcessedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return savedPolicy;
    }

    @Transactional
    public InsurancePolicy processOsagoPayment(Long applicationId, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        OsagoApplication application = applicationRepository.findById(applicationId)
                .filter(app -> app instanceof OsagoApplication && app.getUser().equals(user))
                .map(app -> (OsagoApplication) app)
                .orElseThrow(() -> new EntityNotFoundException("OsagoApplication not found with id " + applicationId + " for user " + usernameOrEmail));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Application is not in PENDING status, cannot process payment. Current status: " + application.getStatus());
        }

        Insurance.InsuranceCategory osagoCategory = insuranceRepository.findCategoryByName("OSAGO");
        if (osagoCategory == null) {
            osagoCategory = new Insurance.InsuranceCategory();
            osagoCategory.setName("OSAGO");
            osagoCategory.setDescription("Стандартная категория ОСАГО");
            osagoCategory.setBasePrice(BigDecimal.ZERO); 
            osagoCategory.setType("AUTO");
            insuranceRepository.saveCategory(osagoCategory);
            osagoCategory = insuranceRepository.findCategoryByName("OSAGO"); // Refresh to get managed entity
        }

        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName("ОСАГО Полис для " + application.getCarMake() + " " + application.getCarModel());
        policy.setDescription("Полис ОСАГО, сформированный на основе заявки #" + application.getId());
        policy.setPrice(application.getCalculatedAmount());
        policy.setCategory(osagoCategory);
        policy.setActive(true);
        policy.setStartDate(application.getStartDate() != null ? application.getStartDate() : LocalDate.now());
        
        if (application.getEndDate() != null) {
            policy.setEndDate(application.getEndDate());
        } else if (application.getDuration() != null) {
            policy.setEndDate(policy.getStartDate().plusMonths(application.getDuration()));
        } else {
            policy.setEndDate(policy.getStartDate().plusYears(1)); // По умолчанию на год
        }
        policy.setStatus(Insurance.PolicyStatus.ACTIVE);

        InsurancePolicy savedPolicy = insuranceRepository.save(policy);

        application.setStatus("ACTIVE");
        application.setPolicy(savedPolicy);
        application.setProcessedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return savedPolicy;
    }

    @Transactional
    public InsurancePolicy processHealthPayment(Long applicationId, String usernameOrEmail) {
        User user = findUser(usernameOrEmail);
        HealthApplication application = applicationRepository.findById(applicationId)
                .filter(app -> app instanceof HealthApplication && app.getUser().equals(user))
                .map(app -> (HealthApplication) app)
                .orElseThrow(() -> new EntityNotFoundException("HealthApplication not found with id " + applicationId + " for user " + usernameOrEmail));

        if (!"PENDING".equalsIgnoreCase(application.getStatus())) {
            throw new IllegalStateException("Application is not in PENDING status, cannot process payment. Current status: " + application.getStatus());
        }

        Insurance.InsuranceCategory healthCategory = insuranceRepository.findCategoryByName("HEALTH");
        if (healthCategory == null) {
            healthCategory = new Insurance.InsuranceCategory();
            healthCategory.setName("HEALTH");
            healthCategory.setDescription("Стандартная категория Здоровье");
            healthCategory.setBasePrice(BigDecimal.ZERO);
            healthCategory.setType("HEALTH"); // Или другой подходящий тип, если есть
            insuranceRepository.saveCategory(healthCategory);
            healthCategory = insuranceRepository.findCategoryByName("HEALTH");
        }

        InsurancePolicy policy = new InsurancePolicy();
        policy.setUser(user);
        policy.setName("Полис страхования здоровья для " + user.getFirstName() + " " + user.getLastName());
        policy.setDescription("Полис страхования здоровья, сформированный на основе заявки #" + application.getId());
        policy.setPrice(application.getCalculatedAmount());
        policy.setCategory(healthCategory);
        policy.setActive(true);
        policy.setStartDate(application.getStartDate() != null ? application.getStartDate() : LocalDate.now());
        
        if (application.getEndDate() != null) {
            policy.setEndDate(application.getEndDate());
        } else {
            policy.setEndDate(policy.getStartDate().plusYears(1)); // По умолчанию на год
        }
        policy.setStatus(Insurance.PolicyStatus.ACTIVE);

        InsurancePolicy savedPolicy = insuranceRepository.save(policy);

        application.setStatus("ACTIVE");
        application.setPolicy(savedPolicy);
        application.setProcessedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return savedPolicy;
    }

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
    @Transactional(readOnly = true)
    public List<InsurancePackage> getPublicPackages() {
        return insuranceRepository.findByActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<InsurancePackage> getAllPackages() {
        return insuranceRepository.findAllPackages();
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
        claim.setStatus(Claims.ClaimStatus.PENDING);
        return claimsRepository.save(claim);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<InsurancePolicy> findPolicyById(Long id) {
        return insuranceRepository.findById(id);
    }

    @Transactional
    public ClaimAttachment saveAttachment(ClaimAttachment attachment) {
        return claimsRepository.saveAttachment(attachment);
    }

    @Transactional(readOnly = true)
    public List<Claims.ClaimMessage> getClaimMessages(Long claimId, String email) {
        User user = findUser(email);
        InsuranceClaim claim = claimsRepository.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found: " + claimId));
        
        // Verify the user has access to this claim
        if (!claim.getUser().equals(user) && !user.getRole().equals(Role.ADMIN)) {
            throw new SecurityException("User does not have access to this claim");
        }
        
        return claimsRepository.findMessagesByClaim(claimId);
    }

    @Transactional
    public Claims.ClaimMessage addClaimMessage(Long claimId, String messageContent, String email) {
        User user = findUser(email);
        InsuranceClaim claim = claimsRepository.findById(claimId)
                .orElseThrow(() -> new EntityNotFoundException("Claim not found: " + claimId));
        
        // Verify the user has access to this claim
        if (!claim.getUser().equals(user) && !user.getRole().equals(Role.ADMIN)) {
            throw new SecurityException("User does not have access to this claim");
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

        Claims.ClaimStatus currentStatus = claim.getStatus();

        if (currentStatus == Claims.ClaimStatus.CLOSED || currentStatus == Claims.ClaimStatus.APPROVED) {
            throw new IllegalStateException("Claim cannot be cancelled as it's already " + currentStatus);
        }

        claim.setStatus(Claims.ClaimStatus.CLOSED);
        return claimsRepository.save(claim);
    }

    @Transactional
    public Map<String, Object> cancelPolicy(Long policyId, String username, String reason) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + username));

        InsurancePolicy policy = insuranceRepository.findByIdAndUser(policyId, user)
                .orElseThrow(() -> new EntityNotFoundException("Policy not found with id " + policyId + " for user " + username));

        if (policy.getStatus() != Insurance.PolicyStatus.ACTIVE) {
            throw new IllegalStateException("Policy cannot be cancelled. Current status: " + policy.getStatus() + ". Policy must be ACTIVE to be cancelled.");
        }

        BigDecimal refundAmount = BigDecimal.ZERO;
        long daysSinceActivation = ChronoUnit.DAYS.between(policy.getStartDate(), LocalDate.now());
        long totalPolicyDurationDays = ChronoUnit.DAYS.between(policy.getStartDate(), policy.getEndDate());

        if (totalPolicyDurationDays <= 0) {
            throw new IllegalStateException("Policy duration is invalid.");
        }
        if (daysSinceActivation < 0) { 
             daysSinceActivation = 0; 
        }

        if (daysSinceActivation <= 14) {
            refundAmount = policy.getPrice();
        } else {
            BigDecimal policyPrice = policy.getPrice();
            if (policyPrice == null) {
                 throw new IllegalStateException("Policy price is not set.");
            }
            BigDecimal dailyRate = policyPrice.divide(BigDecimal.valueOf(totalPolicyDurationDays), 10, RoundingMode.HALF_UP);
            long remainingDays = totalPolicyDurationDays - daysSinceActivation;
            if (remainingDays > 0) {
                BigDecimal proRataRefund = dailyRate.multiply(BigDecimal.valueOf(remainingDays));
                BigDecimal adminFeePercentage = new BigDecimal("0.20");
                BigDecimal adminFee = proRataRefund.multiply(adminFeePercentage);
                refundAmount = proRataRefund.subtract(adminFee);
            }
        }

        if (refundAmount.compareTo(BigDecimal.ZERO) < 0) {
            refundAmount = BigDecimal.ZERO;
        }

        policy.setStatus(Insurance.PolicyStatus.CANCELLED);
        policy.setActive(false);
        insuranceRepository.save(policy);

        if (user.getPolicyCount() > 0) {
             user.setPolicyCount(user.getPolicyCount() -1);
             userRepository.save(user);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Полис успешно отменен. Сумма возврата: " + refundAmount.setScale(2, RoundingMode.HALF_UP).toPlainString() + " ₽");
        result.put("refundAmount", refundAmount.setScale(2, RoundingMode.HALF_UP));

        return result;
    }

    private void setCalculationRulesForGuide(InsuranceGuide guide) {
        if ("KASKO".equalsIgnoreCase(guide.getInsuranceType())) {
            guide.setCalculationRules(
                "Базовая ставка: 5% от стоимости автомобиля.\\n" +
                "Год выпуска: +10% к базовой ставке, если авто старше 10 лет; +5%, если старше 5 лет.\\n" +
                "Стаж вождения: +15% к базовой ставке, если стаж < 3 лет; +7%, если стаж < 5 лет.\\n" +
                "Противоугонная система: -5% от базовой ставки.\\n" +
                "Гаражное хранение: -3% от базовой ставки.\\n" +
                "Длительность: Стоимость корректируется пропорционально сроку, если он не равен 12 месяцам."
            );
        } else if ("OSAGO".equalsIgnoreCase(guide.getInsuranceType())) {
            guide.setCalculationRules(
                "Для ОСАГО расчет зависит от мощности двигателя, региона, стажа, КБМ и др. (Упрощенная логика будет добавлена позже)."
            );
        } else {
            guide.setCalculationRules("Правила расчета для данного типа страхования пока не определены.");
        }
    }
} 