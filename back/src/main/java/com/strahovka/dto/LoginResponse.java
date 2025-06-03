package com.strahovka.dto;

import com.strahovka.enums.Role;
import com.strahovka.enums.UserLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    private int policyCount;
} 