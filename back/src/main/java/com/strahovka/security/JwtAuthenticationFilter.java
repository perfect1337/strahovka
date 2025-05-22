package com.strahovka.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import io.jsonwebtoken.Claims;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userEmail;

            System.out.println("\n=== Processing Request ===");
            System.out.println("Request URL: " + request.getRequestURI());
            System.out.println("Auth Header present: " + (authHeader != null));
            
            // For OPTIONS requests (CORS preflight), just proceed
            if (request.getMethod().equals("OPTIONS")) {
                System.out.println("OPTIONS request - proceeding with chain");
                filterChain.doFilter(request, response);
                return;
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("No valid Authorization header found - proceeding with chain");
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            try {
                userEmail = jwtService.extractUsername(jwt);
                
                System.out.println("JWT token: " + jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
                System.out.println("User email from token: " + userEmail);

                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                    
                    System.out.println("User details loaded: " + userDetails.getUsername());
                    System.out.println("User authorities: " + userDetails.getAuthorities());

                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        // Print the authorities of the user for debugging
                        System.out.println("JWT Extraction - User Authorities before creating token:");
                        userDetails.getAuthorities().forEach(auth -> {
                            System.out.println("  - Authority: " + auth.getAuthority() + ", Class: " + auth.getClass().getName());
                        });
                        
                        // Create authentication token with user's authorities
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            jwt, // Store the token in the credentials field for debugging
                            userDetails.getAuthorities()
                        );
                        
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        System.out.println("Authentication successful");
                        System.out.println("Final authorities in SecurityContext: " + 
                            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                    } else {
                        System.out.println("Token validation failed");
                        System.out.println("Token details:");
                        try {
                            System.out.println("Expiration: " + jwtService.extractClaim(jwt, Claims::getExpiration));
                            System.out.println("IssuedAt: " + jwtService.extractClaim(jwt, Claims::getIssuedAt));
                            System.out.println("Subject: " + jwtService.extractClaim(jwt, Claims::getSubject));
                            System.out.println("Roles: " + jwtService.extractRoles(jwt));
                        } catch (Exception e) {
                            System.out.println("Error extracting token details: " + e.getMessage());
                        }
                    }
                }
            } catch (Exception e) {
                System.out.println("Exception processing JWT token: " + e.getMessage());
                e.printStackTrace();
            }
        } catch (Exception e) {
            System.out.println("Error in JWT filter: " + e.getMessage());
            e.printStackTrace();
        } finally {
            System.out.println("=== Request Processing Complete ===\n");
            filterChain.doFilter(request, response);
        }
    }
} 