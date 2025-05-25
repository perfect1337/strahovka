package com.strahovka.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.strahovka.repository.UserRepository;
import com.strahovka.delivery.User;

import java.io.IOException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            // Add CORS headers for all responses
            response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Requested-With, Accept");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Max-Age", "3600");

            // For OPTIONS requests (CORS preflight), just proceed
            if (request.getMethod().equals("OPTIONS")) {
                response.setStatus(HttpServletResponse.SC_OK);
                filterChain.doFilter(request, response);
                return;
            }

            final String authHeader = request.getHeader("Authorization");
            System.out.println("\n=== Processing Request ===");
            System.out.println("Request URL: " + request.getRequestURI());
            System.out.println("Request Method: " + request.getMethod());
            System.out.println("Auth Header present: " + (authHeader != null));
            System.out.println("Auth Header: " + authHeader);

            // Skip authentication for public endpoints
            if (isPublicEndpoint(request.getRequestURI())) {
                System.out.println("Public endpoint detected, skipping authentication");
                filterChain.doFilter(request, response);
                return;
            }

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("No valid Authorization header found");
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "No valid Authorization header found");
                return;
            }

            final String token = authHeader.substring(7);
            final String userEmail = jwtService.extractUsername(token);

            System.out.println("Extracted email from token: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                System.out.println("Found user: " + user.getEmail());
                System.out.println("Stored access token: " + user.getAccessToken());
                System.out.println("Received token: " + token);

                // Validate token
                System.out.println("\n=== Token Validation ===");
                System.out.println("Token username: " + userEmail);
                System.out.println("UserDetails username: " + userDetails.getUsername());
                System.out.println("Token expiration: " + jwtService.extractExpiration(token));
                System.out.println("Current time: " + new java.util.Date());
                System.out.println("Token roles: " + jwtService.extractClaim(token, claims -> claims.get("roles", String.class)));

                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("Authentication successful for user: " + userEmail);
                    System.out.println("Authorities: " + userDetails.getAuthorities());
                    filterChain.doFilter(request, response);
                } else {
                    System.out.println("Token validation failed for user: " + userEmail);
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token validation failed");
                }
            } else {
                filterChain.doFilter(request, response);
            }
        } catch (Exception e) {
            System.out.println("Error in JwtAuthenticationFilter: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication failed: " + e.getMessage());
        }
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.contains("/api/auth/login") ||
               uri.contains("/api/auth/register") ||
               uri.contains("/api/auth/refresh-token") ||
               uri.contains("/api/insurance/packages") ||
               uri.contains("/api/insurance/categories") ||
               uri.contains("/api/users/change-password") ||
               uri.contains("/debug");
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\": \"" + message + "\"}");
    }
} 