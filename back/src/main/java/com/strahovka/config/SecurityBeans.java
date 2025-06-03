package com.strahovka.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

@Configuration
public class SecurityBeans {
    
    public SecurityBeans() {}

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Удаляем defaultSecurityFilterChain, так как его логика перенесена в SecurityConfig.java
    // @Bean
    // @Order(2)
    // public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
    //     http
    //         .csrf(AbstractHttpConfigurer::disable)
    //         .authorizeHttpRequests(auth -> auth
    //             .requestMatchers("/error").permitAll()
    //             .anyRequest().authenticated()
    //         )
    //         .httpBasic(AbstractHttpConfigurer::disable);
    //     return http.build();
    // }
} 