package com.strahovka.entity;

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
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private UserLevel level;
    private int policyCount;
} 