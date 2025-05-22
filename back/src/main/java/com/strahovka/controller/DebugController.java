package com.strahovka.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/headers")
    public ResponseEntity<?> showHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        Enumeration<String> headerNames = request.getHeaderNames();
        
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            String value = name.equalsIgnoreCase("authorization") ? 
                           "[REDACTED]" : request.getHeader(name);
            headers.put(name, value);
        }
        
        return ResponseEntity.ok(headers);
    }
    
    @GetMapping("/auth-status")
    public ResponseEntity<?> checkAuthStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        Map<String, Object> status = new HashMap<>();
        status.put("authenticated", auth != null && auth.isAuthenticated());
        status.put("principal", auth != null ? auth.getPrincipal() : null);
        
        if (auth != null) {
            status.put("name", auth.getName());
            status.put("authorities", auth.getAuthorities().stream()
                .map(a -> Map.of(
                    "authority", a.getAuthority(),
                    "class", a.getClass().getSimpleName()
                ))
                .collect(Collectors.toList()));
        }
        
        return ResponseEntity.ok(status);
    }
    
    @GetMapping("/server-info")
    public ResponseEntity<?> getServerInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("timestamp", new java.util.Date().toString());
        info.put("javaVersion", System.getProperty("java.version"));
        info.put("osName", System.getProperty("os.name"));
        info.put("threadCount", Thread.activeCount());
        info.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        
        return ResponseEntity.ok(info);
    }
} 