package com.strahovka.dto;

import com.strahovka.delivery.Role;
import com.strahovka.delivery.UserLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String middleName;
    private String phone;
    private Role role;
    private UserLevel level;
    private Integer policyCount;
} 