package com.strahovka.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
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
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

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
            System.out.println("Method: " + request.getMethod());
            System.out.println("Auth Header present: " + (authHeader != null));
            
            // For OPTIONS requests (CORS preflight), just proceed
            if (request.getMethod().equals("OPTIONS")) {
                System.out.println("OPTIONS request - proceeding with chain");
                filterChain.doFilter(request, response);
                return;
            }

            // Check for public paths that don't require authentication
            if (isPublicPath(request.getRequestURI())) {
                System.out.println("Public path detected, skipping authentication: " + request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("No valid Authorization header found - request URL: " + request.getRequestURI());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setHeader("X-Auth-Error", "Missing or invalid Authorization header");
                return;
            }

            // Extract token and user info
            jwt = authHeader.substring(7);
            System.out.println("JWT token found in request, length: " + jwt.length());
            
            try {
                userEmail = jwtService.extractUsername(jwt);
                System.out.println("User email from token: " + userEmail);

                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                    
                    System.out.println("User details loaded: " + userDetails.getUsername());
                    System.out.println("User authorities: " + userDetails.getAuthorities());

                    if (jwtService.isTokenValid(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                        
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        
                        System.out.println("Authentication successful");
                        filterChain.doFilter(request, response);
                    } else {
                        System.out.println("Token validation failed");
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.setHeader("X-Auth-Error", "Token validation failed");
                        return;
                    }
                } else {
                    System.out.println("No user email in token or authentication already exists");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setHeader("X-Auth-Error", "Invalid token");
                    return;
                }
            } catch (ExpiredJwtException e) {
                System.out.println("Token has expired: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setHeader("X-Auth-Error", "Token expired");
                return;
            } catch (JwtException e) {
                System.out.println("JWT error processing token: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setHeader("X-Auth-Error", "Invalid token");
                return;
            } catch (Exception e) {
                System.out.println("Exception processing JWT token: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setHeader("X-Auth-Error", "Token processing error");
                return;
            }
        } catch (Exception e) {
            System.out.println("Error in JWT filter: " + e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setHeader("X-Auth-Error", "Internal authentication error");
            return;
        }
    }
    
    private boolean isPublicPath(String uri) {
        return uri.startsWith("/api/auth/login") ||
               uri.startsWith("/api/auth/register") ||
               uri.startsWith("/api/auth/refresh-token") ||
               uri.startsWith("/api/auth/validate") ||
               uri.startsWith("/api/auth/test") ||
               uri.startsWith("/api/auth/debug-token") ||
               uri.startsWith("/api/auth/debug-login") ||
               uri.startsWith("/api/auth/create-test-user") ||
               uri.startsWith("/api/auth/me") ||
               uri.startsWith("/api/debug/") ||
               uri.equals("/api/insurance/packages") ||
               uri.equals("/api/insurance/categories") ||
               uri.equals("/error");
    }
} 