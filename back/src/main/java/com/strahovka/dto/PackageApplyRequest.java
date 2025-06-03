package com.strahovka.dto;

import lombok.Data;
import java.util.List;
 
@Data
public class PackageApplyRequest {
    private List<PackageApplicationItem> applications;
} 