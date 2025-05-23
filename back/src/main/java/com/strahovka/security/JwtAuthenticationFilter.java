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
                return;
            }

            final String authHeader = request.getHeader("Authorization");
            System.out.println("\n=== Processing Request ===");
            System.out.println("Request URL: " + request.getRequestURI());
            System.out.println("Request Method: " + request.getMethod());
            System.out.println("Auth Header present: " + (authHeader != null));
            System.out.println("Auth Header: " + (authHeader != null ? authHeader.substring(0, Math.min(authHeader.length(), 20)) + "..." : "null"));

            // Skip authentication for public endpoints
            if (isPublicEndpoint(request.getRequestURI())) {
                System.out.println("Public endpoint - proceeding with chain");
                filterChain.doFilter(request, response);
                return;
            }

            // Check if authentication is required
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("No valid Authorization header found");
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "No valid Authorization header found");
                return;
            }

            try {
                final String token = authHeader.substring(7);
                String userEmail = jwtService.extractUsername(token);

                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                    User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new RuntimeException("User not found"));

                    // Check if the token matches the stored access token
                    if (!token.equals(user.getAccessToken())) {
                        System.out.println("Token mismatch");
                        sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
                        return;
                    }

                    if (jwtService.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        System.out.println("Authentication successful");
                        System.out.println("Final authorities in SecurityContext: " + 
                            SecurityContextHolder.getContext().getAuthentication().getAuthorities());
                    }
                }

                filterChain.doFilter(request, response);
            } catch (ExpiredJwtException e) {
                System.out.println("Token expired: " + e.getMessage());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token expired");
            } catch (SignatureException e) {
                System.out.println("Invalid token signature: " + e.getMessage());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token signature");
            } catch (MalformedJwtException e) {
                System.out.println("Malformed token: " + e.getMessage());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Malformed token");
            } catch (Exception e) {
                System.out.println("Error processing token: " + e.getMessage());
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Error processing token");
            }
        } catch (Exception e) {
            System.out.println("Error in JWT filter: " + e.getMessage());
            e.printStackTrace();
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication error: " + e.getMessage());
        }
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.contains("/api/auth/login") ||
               uri.contains("/api/auth/register") ||
               uri.contains("/api/auth/refresh-token") ||
               uri.contains("/api/insurance/packages") ||
               uri.contains("/api/insurance/categories") ||
               uri.contains("/api/debug/");
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\": \"" + message + "\"}");
    }
} 