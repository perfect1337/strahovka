package com.strahovka.middleware;

import com.strahovka.service.JwtService;
import com.strahovka.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthMiddleware implements Filter {
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh-token",
        "/api/insurance/unauthorized",
        "/api/insurance/packages/public",
        "/api/insurance/categories",
        "/api/insurance/guides"
    );

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        log.debug("AuthMiddleware doFilter for path: {}", request.getRequestURI());

        // Handle preflight requests - This should be handled by CORS configuration (WebConfig)
        // or a dedicated CorsFilter in Spring Security. For simplicity, we might keep basic OPTIONS handling
        // if WebConfig isn't fully covering it or if it's executed later.
        // For now, let's rely on WebConfig and Spring Security's CorsFilter if configured.
        /*
        if (request.getMethod().equals("OPTIONS")) {
            log.debug("OPTIONS request, responding with SC_OK");
            response.setStatus(HttpServletResponse.SC_OK);
            return; // Don't proceed down the chain for OPTIONS
        }
        */

        String path = request.getRequestURI();
        
        if (isPublicPath(path)) {
            log.debug("Path {} is public, allowing request to proceed down the filter chain.", path);
            chain.doFilter(request, response); // Proceed for public paths
            return;
        }

        log.debug("Path {} is not public, proceeding with authentication.", path);
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Authorization header is missing or invalid for path: {}", path);
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Authorization header is missing or invalid.");
            return; // Stop processing
        }

        String token = authHeader.substring(7);
        String userEmail = null;

        try {
            userEmail = jwtService.extractUsername(token);
            log.debug("Extracted userEmail: {} from token for path: {}", userEmail, path);
        } catch (Exception e) {
            log.warn("Invalid token format or signature for path: {}. Error: {}", path, e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid token format or signature.");
            return; // Stop processing
        }

        // Check if authentication is already set, possibly by a previous filter or if the user is already authenticated.
        // If we strictly want this filter to be the one authenticating, we might clear existing auth first, 
        // or only proceed if SecurityContextHolder.getContext().getAuthentication() is null.
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.debug("UserEmail {} is not null and SecurityContext is empty. Attempting to authenticate.", userEmail);
            UserDetails userDetails = userRepository.findByEmail(userEmail)
                .orElse(null);

            if (userDetails != null) {
                log.debug("UserDetails found for email: {}. User: {}", userEmail, userDetails.getUsername());
                if (jwtService.isTokenValid(token, userDetails.getUsername())) {
                    log.debug("Token is valid for user: {}", userDetails.getUsername());
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    log.info("Successfully set authentication in SecurityContextHolder for user: {}. New Authentication: {}", userDetails.getUsername(), SecurityContextHolder.getContext().getAuthentication());
                    
                    request.setAttribute("userEmail", userEmail); // Can still be useful for other parts of app if needed
                } else {
                    log.warn("Token is invalid or expired for user: {}. Path: {}", userDetails.getUsername(), path);
                    // Clear context if any partial/invalid auth was set, though unlikely here
                    SecurityContextHolder.clearContext(); 
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token is invalid or expired.");
                    return; // Stop processing
                }
            } else {
                log.warn("UserDetails not found for email: {}. Path: {}", userEmail, path);
                SecurityContextHolder.clearContext(); 
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "User not found for the provided token.");
                return; // Stop processing
            }
        } else if (userEmail == null) {
            log.warn("Could not extract user email from token (userEmail is null). Path: {}", path);
            SecurityContextHolder.clearContext(); 
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Could not extract user email from token.");
            return; // Stop processing
        }
        // If userEmail != null AND SecurityContextHolder.getContext().getAuthentication() != null,
        // it means authentication was already set (e.g., by this filter on a previous run for same request dispatch, or another filter).
        // We can log this state.
        log.debug("Proceeding with filter chain. Current auth: {}", SecurityContextHolder.getContext().getAuthentication());
        chain.doFilter(request, response); // Proceed with the next filter in the chain
    }

    private boolean isPublicPath(String path) {
        // Ensure paths are matched correctly, e.g. /api/insurance/packages/public should match
        return PUBLIC_PATHS.stream().anyMatch(publicPath -> path.matches(publicPath + "(/.*)?"));
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        if (!response.isCommitted()) {
            response.setStatus(status);
            response.setContentType("application/json");
            response.getWriter().write(objectMapper.writeValueAsString(Map.of("message", message, "error", "Unauthorized"))); // Added more error details
        }
    }

    // init and destroy methods from Filter interface can be left empty for this stateless filter
    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        log.info("AuthMiddleware Filter initialized.");
    }

    @Override
    public void destroy() {
        log.info("AuthMiddleware Filter destroyed.");
    }
} 