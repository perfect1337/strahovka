package com.strahovka.config;

import com.strahovka.security.CustomUserDetailsService;
import com.strahovka.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import java.util.Arrays;
import java.util.List;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        System.out.println("Configuring security rules...");
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> {
                System.out.println("Setting up authorization rules");
                auth
                    // Public endpoints
                    .requestMatchers(
                        antMatcher("/api/auth/login"),
                        antMatcher("/api/auth/register"),
                        antMatcher("/api/auth/refresh-token"),
                        antMatcher("/api/auth/validate"),
                        antMatcher("/api/auth/test"),
                        antMatcher("/api/auth/debug-token"),
                        antMatcher("/api/auth/debug-login"),
                        antMatcher("/api/auth/create-test-user"),
                        antMatcher("/api/auth/me"),
                        antMatcher("/api/debug/**"),
                        antMatcher("/api/insurance/packages"),
                        antMatcher("/api/insurance/categories"),
                        antMatcher("/error")
                    ).permitAll()
                    
                    // Admin-only endpoints
                    .requestMatchers(antMatcher("/api/admin/**")).hasAuthority("ROLE_ADMIN")
                    .requestMatchers(antMatcher("/api/insurance/claims/pending")).hasAuthority("ROLE_ADMIN")
                    .requestMatchers(antMatcher("/api/insurance/claims/{claimId}/process")).hasAuthority("ROLE_ADMIN")
                    
                    // Protected endpoints
                    .requestMatchers(
                        antMatcher("/api/insurance/policies/**"),
                        antMatcher("/api/insurance/claims/**"),
                        antMatcher("/api/insurance/policies"),
                        antMatcher("/api/insurance/claims")
                    ).authenticated()
                    
                    // Default for anything else
                    .anyRequest().authenticated();
            })
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(handling -> handling
                .authenticationEntryPoint((request, response, ex) -> {
                    System.out.println("\n=== Authentication Failure ===");
                    System.out.println("Request URL: " + request.getRequestURI());
                    System.out.println("Method: " + request.getMethod());
                    System.out.println("Exception type: " + ex.getClass().getName());
                    System.out.println("Error message: " + ex.getMessage());
                    
                    // Set CORS headers
                    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");
                    response.setHeader("Access-Control-Expose-Headers", "X-Auth-Error");
                    response.setContentType("application/json;charset=UTF-8");
                    
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"message\": \"Authentication failed: " + ex.getMessage() + "\"}");
                })
                .accessDeniedHandler((request, response, ex) -> {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    System.out.println("\n=== Access Denied ===");
                    System.out.println("Request URL: " + request.getRequestURI());
                    System.out.println("User: " + (auth != null ? auth.getName() : "null"));
                    System.out.println("Authorities: " + (auth != null ? auth.getAuthorities() : "null"));
                    System.out.println("Error message: " + ex.getMessage());
                    
                    // Set CORS headers
                    response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");
                    response.setHeader("Access-Control-Expose-Headers", "X-Auth-Error");
                    response.setContentType("application/json;charset=UTF-8");
                    
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.getWriter().write("{\"message\": \"Access Denied: " + ex.getMessage() + "\"}");
                })
            );

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
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-Auth-Error"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept")
                    .allowCredentials(true);
            }
        };
    }
} 