package com.strahovka.dto;

import com.strahovka.entity.InsurancePolicy;
import org.springframework.stereotype.Component;

@Component
public class InsurancePolicyMapper {

    public InsurancePolicyDTO toDto(InsurancePolicy policy) {
        if (policy == null) {
            return null;
        }

        InsurancePolicyDTO dto = new InsurancePolicyDTO();
        dto.setId(policy.getId());
        dto.setName(policy.getName());
        dto.setDescription(policy.getDescription());
        dto.setPrice(policy.getPrice());
        dto.setStartDate(policy.getStartDate());
        dto.setEndDate(policy.getEndDate());
        dto.setActive(policy.isActive());
        dto.setStatus(policy.getStatus());

        if (policy.getCategory() != null) {
            InsurancePolicyDTO.InsuranceCategoryDTO categoryDTO = new InsurancePolicyDTO.InsuranceCategoryDTO();
            categoryDTO.setId(policy.getCategory().getId());
            categoryDTO.setName(policy.getCategory().getName());
            categoryDTO.setDescription(policy.getCategory().getDescription());
            categoryDTO.setType(policy.getCategory().getType());
            dto.setCategory(categoryDTO);
        }

        return dto;
    }
} 