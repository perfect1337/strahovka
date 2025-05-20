package com.strahovka.controller;

import com.strahovka.delivery.User;
import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insurance/applications")
@RequiredArgsConstructor
public class InsuranceApplicationController {
    private final UserRepository userRepository;

    @PostMapping("/health")
    public ResponseEntity<?> createHealthApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на страхование здоровья
        // Для демонстрации просто логируем
        System.out.println("Получена заявка на страхование здоровья: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", ФИО: " + application.get("fio") + 
                           ", Дата рождения: " + application.get("birthDate"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на страхование здоровья принята"));
    }

    @PostMapping("/kasko")
    public ResponseEntity<?> createKaskoApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на КАСКО
        System.out.println("Получена заявка на КАСКО: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", Модель: " + application.get("carModel") + 
                           ", VIN: " + application.get("vin"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на КАСКО принята"));
    }

    @PostMapping("/osago")
    public ResponseEntity<?> createOsagoApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на ОСАГО
        System.out.println("Получена заявка на ОСАГО: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", Модель: " + application.get("carModel") + 
                           ", Стаж: " + application.get("driverExp"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на ОСАГО принята"));
    }

    @PostMapping("/realestate")
    public ResponseEntity<?> createRealEstateApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на страхование недвижимости
        System.out.println("Получена заявка на страхование недвижимости: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", Адрес: " + application.get("address") + 
                           ", Площадь: " + application.get("area"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на страхование недвижимости принята"));
    }

    @PostMapping("/other")
    public ResponseEntity<?> createOtherApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на прочие виды страхования
        System.out.println("Получена заявка на прочее страхование: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", Название: " + application.get("title"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка принята"));
    }
    
    @PostMapping("/travel")
    public ResponseEntity<?> createTravelApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на страхование путешествий
        System.out.println("Получена заявка на страхование путешествий: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", ФИО: " + application.get("fio") + 
                           ", Страна: " + application.get("country") + 
                           ", Цель поездки: " + application.get("purpose"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на страхование путешествий принята"));
    }
    
    @PostMapping("/apartment")
    public ResponseEntity<?> createApartmentApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на страхование квартиры
        System.out.println("Получена заявка на страхование квартиры: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", Адрес: " + application.get("address") + 
                           ", Площадь: " + application.get("area") + 
                           ", Тип квартиры: " + application.get("apartmentType"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на страхование квартиры принята"));
    }
    
    @PostMapping("/mortgage")
    public ResponseEntity<?> createMortgageApplication(@RequestBody Map<String, String> application) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = null;
        
        if (!"anonymousUser".equals(username)) {
            user = userRepository.findByEmail(username)
                .orElse(null);
        }
        
        // Здесь должна быть логика обработки заявки на ипотечное страхование
        System.out.println("Получена заявка на ипотечное страхование: " + application);
        System.out.println("От пользователя: " + (user != null ? user.getEmail() : "Анонимный") + 
                           ", Адрес: " + application.get("propertyAddress") + 
                           ", Банк: " + application.get("bankName") + 
                           ", Сумма кредита: " + application.get("loanAmount"));
        
        return ResponseEntity.ok(Map.of("status", "success", "message", "Заявка на ипотечное страхование принята"));
    }
} 