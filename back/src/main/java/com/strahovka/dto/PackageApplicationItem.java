package com.strahovka.dto;

import lombok.Data;
import java.util.Map;

@Data
public class PackageApplicationItem {
    private String type; // Технический тип категории, например, "AUTO", "TRAVEL"
    private String label; // Метка/название полиса из категории, например, "КАСКО", "ОСАГО"
    private Map<String, Object> data; // Данные из формы (включая поля пользователя и специфичные для полиса)
} 