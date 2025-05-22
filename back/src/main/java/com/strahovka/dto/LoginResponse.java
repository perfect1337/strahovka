package com.strahovka.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String refreshToken;
    private UserDto user;

    // Constructor that matches the previous format but creates a nested user object
    public LoginResponse(String token, String refreshToken, String email, String firstName, String lastName, String role) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.user = new UserDto(email, firstName, lastName, role);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserDto {
        private String email;
        private String firstName;
        private String lastName;
        private String role;
    }
} 