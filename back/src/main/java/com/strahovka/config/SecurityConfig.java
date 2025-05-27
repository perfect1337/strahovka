package com.strahovka.config;

import com.strahovka.security.CustomUserDetailsService;
import com.strahovka.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()
                .requestMatchers(HttpMethod.GET,
                    "/api/insurance/packages",
                    "/api/insurance/categories",
                    "/api/insurance/guides/**"
                ).permitAll()
                .requestMatchers(HttpMethod.POST,
                    "/api/insurance/packages",
                    "/api/insurance/guides"
                ).hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT,
                    "/api/insurance/packages/**",
                    "/api/insurance/guides/**"
                ).hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE,
                    "/api/insurance/packages/**",
                    "/api/insurance/guides/**"
                ).hasAuthority("ROLE_ADMIN")
                .requestMatchers(
                    "/api/insurance/categories/**",
                    "/api/admin/**"
                ).hasAuthority("ROLE_ADMIN")
                .requestMatchers(
                    "/api/users/profile",
                    "/api/insurance/applications/**",
                    "/api/insurance/policies/**",
                    "/api/insurance/claims/user/**",
                    "/api/insurance/claims/{claimId}/messages/**"
                ).hasAnyAuthority("ROLE_USER", "ROLE_ADMIN", "ROLE_MODERATOR")
                .requestMatchers("/api/insurance/claims/all").hasAnyAuthority("ROLE_ADMIN", "ROLE_MODERATOR")
                .requestMatchers("/api/insurance/claims/process/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_MODERATOR")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}