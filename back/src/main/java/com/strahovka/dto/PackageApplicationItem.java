package com.strahovka.dto;

import lombok.Data;
import java.util.Map;

@Data
public class PackageApplicationItem {
    private String type;
    private String label;
    private Map<String, Object> data;
} 