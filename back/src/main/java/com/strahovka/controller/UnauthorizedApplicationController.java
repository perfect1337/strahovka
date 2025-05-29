package com.strahovka.controller;

import com.strahovka.delivery.*;
import com.strahovka.entity.ApplicationStatus;
import com.strahovka.service.UserService;
import com.strahovka.service.InsurancePackageService;
import com.strahovka.repository.InsuranceApplicationRepository;
import com.strahovka.repository.KaskoApplicationRepository;
import com.strahovka.repository.InsurancePolicyRepository;
import com.strahovka.repository.InsuranceCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/insurance/unauthorized")
@RequiredArgsConstructor
public class UnauthorizedApplicationController {
    private final UserService userService;
    private final InsurancePackageService packageService;
    private final InsuranceApplicationRepository applicationRepository;
    private final KaskoApplicationRepository kaskoApplicationRepository;
    private final InsurancePolicyRepository policyRepository;
    private final InsuranceCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/apply")
    public ResponseEntity<?> createApplicationWithRegistration(@RequestBody Map<String, Object> request) {
        try {
            // Create or get user
            User user = userService.findByEmail(request.get("email").toString())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(request.get("email").toString());
                    newUser.setPassword(passwordEncoder.encode(request.get("password").toString()));
                    newUser.setFirstName(request.get("firstName").toString());
                    newUser.setLastName(request.get("lastName").toString());
                    newUser.setMiddleName(request.get("middleName").toString());
                    newUser.setPhone(request.get("phone").toString());
                    newUser.setRole(Role.ROLE_USER);
                    return userService.save(newUser);
                });

            // Get insurance package
            InsurancePackage insurancePackage = packageService.getPackageById(Long.parseLong(request.get("packageId").toString()));

            // Create insurance application
            InsuranceApplication application = new InsuranceApplication();
            application.setUser(user);
            application.setInsurancePackage(insurancePackage);
            application.setType(request.get("type").toString());
            application.setStatus("PENDING");
            application.setCreatedAt(LocalDateTime.now());
            application.setPassportNumber(request.get("passportNumber").toString());
            application.setPassportIssuedBy(request.get("passportIssuedBy").toString());
            application.setPassportIssuedDate(java.time.LocalDate.parse(request.get("passportIssuedDate").toString()));
            application.setBirthDate(java.time.LocalDate.parse(request.get("birthDate").toString()));
            application.setAddress(request.get("address").toString());
            if (request.containsKey("additionalInfo")) {
                application.setAdditionalInfo(request.get("additionalInfo").toString());
            }

            application = applicationRepository.save(application);

            // Generate tokens
            String accessToken = userService.generateAccessToken(user);
            String refreshToken = userService.generateRefreshToken(user);

            // Update user with tokens
            user.setAccessToken(accessToken);
            user.setRefreshToken(refreshToken);
            userService.save(user);

            return ResponseEntity.ok(Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", user,
                "application", application
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Ошибка при создании заявки: " + e.getMessage()));
        }
    }

    @PostMapping("/kasko")
    public ResponseEntity<?> createUnauthorizedKaskoApplication(@RequestBody Map<String, Object> request) {
        try {
            // Log incoming request data
            System.out.println("Received KASKO application request: " + request);
            
            // Validate required fields
            String[] requiredFields = {"email", "firstName", "lastName", "carMake", "carModel", "carYear", 
                                     "vinNumber", "licensePlate", "carValue", "driverLicenseNumber", 
                                     "driverExperienceYears", "duration"};
            
            for (String field : requiredFields) {
                if (!request.containsKey(field) || request.get(field) == null) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Missing required field: " + field
                    ));
                }
            }

            // Извлекаем данные пользователя
            String email = request.get("email").toString();
            String firstName = request.get("firstName").toString();
            String lastName = request.get("lastName").toString();
            String middleName = request.getOrDefault("middleName", "").toString();

            // Проверяем, существует ли пользователь
            if (userService.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Пользователь с таким email уже существует"
                ));
            }

            // Создаем нового пользователя
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setPassword(email); // Используем email в качестве пароля (будет закодирован в registerUser)
            newUser.setFirstName(firstName);
            newUser.setLastName(lastName);
            newUser.setMiddleName(middleName);
            newUser.setRole(Role.ROLE_USER);
            
            // Регистрируем пользователя через сервис
            User registeredUser = userService.registerUser(newUser);

            // Создаем заявку на КАСКО
            KaskoApplication application = new KaskoApplication();
            application.setUser(registeredUser);
            application.setStatus(ApplicationStatus.PENDING);
            application.setApplicationDate(LocalDateTime.now());
            
            // Заполняем данные автомобиля
            application.setCarMake(request.get("carMake").toString());
            application.setCarModel(request.get("carModel").toString());
            application.setCarYear(Integer.parseInt(request.get("carYear").toString()));
            application.setVinNumber(request.get("vinNumber").toString());
            application.setLicensePlate(request.get("licensePlate").toString());
            application.setCarValue(new BigDecimal(request.get("carValue").toString()));
            application.setDriverLicenseNumber(request.get("driverLicenseNumber").toString());
            application.setDriverExperienceYears(Integer.parseInt(request.get("driverExperienceYears").toString()));
            application.setHasAntiTheftSystem(Boolean.parseBoolean(request.get("hasAntiTheftSystem").toString()));
            application.setGarageParking(Boolean.parseBoolean(request.get("garageParking").toString()));
            application.setPreviousInsuranceNumber((String) request.getOrDefault("previousInsuranceNumber", null));
            application.setDuration(Integer.parseInt(request.get("insuranceDuration").toString()));

            // Рассчитываем стоимость полиса
            BigDecimal baseRate = application.getCarValue().multiply(new BigDecimal("0.05")); // 5% от стоимости авто
            if (application.getHasAntiTheftSystem()) {
                baseRate = baseRate.multiply(new BigDecimal("0.95")); // 5% скидка
            }
            if (application.getGarageParking()) {
                baseRate = baseRate.multiply(new BigDecimal("0.95")); // 5% скидка
            }
            if (application.getDriverExperienceYears() < 3) {
                baseRate = baseRate.multiply(new BigDecimal("1.2")); // 20% надбавка
            }
            application.setCalculatedAmount(baseRate.setScale(2, java.math.RoundingMode.HALF_UP));

            // Создаем страховой полис
            InsurancePolicy policy = new InsurancePolicy();
            policy.setUser(registeredUser);
            policy.setName("КАСКО - " + application.getCarMake() + " " + application.getCarModel());
            policy.setDescription("Страховой полис КАСКО для автомобиля " + application.getCarMake() + " " + 
                                application.getCarModel() + " (" + application.getCarYear() + " г.в., VIN: " + 
                                application.getVinNumber() + ")");
            policy.setPrice(application.getCalculatedAmount());
            policy.setStartDate(LocalDate.now());
            policy.setEndDate(LocalDate.now().plusMonths(application.getDuration()));
            policy.setStatus(PolicyStatus.PENDING_PAYMENT);
            policy.setActive(false);

            // Находим и устанавливаем категорию КАСКО
            InsuranceCategory kaskoCategory = categoryRepository.findByName("КАСКО")
                    .orElseThrow(() -> new RuntimeException("KASKO insurance category not found"));
            policy.setCategory(kaskoCategory);

            // Сохраняем полис
            policy = policyRepository.save(policy);

            // Связываем полис с заявкой
            application.setPolicy(policy);

            // Сохраняем заявку
            KaskoApplication savedApplication = kaskoApplicationRepository.save(application);

            // Возвращаем ID заявки, информацию о стоимости и токены
            return ResponseEntity.ok(Map.of(
                "id", savedApplication.getId(),
                "calculatedAmount", savedApplication.getCalculatedAmount(),
                "accessToken", registeredUser.getAccessToken(),
                "refreshToken", registeredUser.getRefreshToken(),
                "email", registeredUser.getEmail(),
                "password", email, // Возвращаем незакодированный пароль для первого входа
                "message", "Application created successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to create application: " + e.getMessage()
            ));
        }
    }
} 