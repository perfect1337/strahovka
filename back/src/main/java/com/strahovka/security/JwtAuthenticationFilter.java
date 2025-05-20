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
import java.util.stream.Collectors;

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
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);
        
        System.out.println("\n=== Processing Request ===");
        System.out.println("Request URL: " + request.getRequestURI());
        System.out.println("JWT token: " + jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
        System.out.println("User email from token: " + userEmail);

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            System.out.println("\n=== User Details ===");
            System.out.println("User details loaded: " + userDetails.getUsername());
            System.out.println("User details class: " + userDetails.getClass().getName());
            System.out.println("User authorities from UserDetails: " + userDetails.getAuthorities());
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                System.out.println("\n=== Token Validation ===");
                // Extract roles from JWT token
                String roles = jwtService.extractClaim(jwt, claims -> {
                    Object rolesObj = claims.get("roles");
                    System.out.println("Raw roles from JWT: " + rolesObj);
                    return rolesObj != null ? rolesObj.toString() : "";
                });
                System.out.println("Roles string from JWT: " + roles);
                
                Collection<SimpleGrantedAuthority> authorities = userDetails.getAuthorities().stream()
                    .map(auth -> {
                        String authority = auth.getAuthority();
                        System.out.println("Processing authority: " + authority);
                        return new SimpleGrantedAuthority(authority);
                    })
                    .collect(Collectors.toList());
                
                System.out.println("Final authorities to be set: " + authorities);
                
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    authorities
                );
                
                authToken.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                System.out.println("\n=== Authentication Result ===");
                System.out.println("Authentication successful");
                System.out.println("Final authorities in SecurityContext: " + 
                    SecurityContextHolder.getContext().getAuthentication().getAuthorities());
            } else {
                System.out.println("\n=== Token Validation Failed ===");
                System.out.println("Token validation failed for user: " + userDetails.getUsername());
                try {
                    System.out.println("Token expiration: " + jwtService.extractClaim(jwt, claims -> claims.getExpiration()));
                    System.out.println("Token issuedAt: " + jwtService.extractClaim(jwt, claims -> claims.getIssuedAt()));
                    System.out.println("Token subject: " + jwtService.extractClaim(jwt, claims -> claims.getSubject()));
                    System.out.println("Token roles: " + jwtService.extractClaim(jwt, claims -> claims.get("roles")));
                } catch (Exception e) {
                    System.out.println("Error extracting token details: " + e.getMessage());
                }
            }
        }
        
        System.out.println("\n=== Request Processing Complete ===\n");
        filterChain.doFilter(request, response);
    }
} 