package com.strahovka.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.ArrayList;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        String roles = userDetails.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));
        
        System.out.println("Generating token for user: " + userDetails.getUsername());
        System.out.println("With roles: " + roles);
        System.out.println("Authorities detail:");
        userDetails.getAuthorities().forEach(auth -> 
            System.out.println("  - " + auth.getAuthority() + " (" + auth.getClass().getSimpleName() + ")")
        );
        
        extraClaims.put("roles", roles);
        
        return generateToken(extraClaims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
            .setClaims(extraClaims)
            .setSubject(userDetails.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            List<String> tokenRoles = extractRoles(token);
            
            System.out.println("\nValidating token for user: " + username);
            System.out.println("Token roles: " + tokenRoles);
            System.out.println("UserDetails roles: " + userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
            
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            System.out.println("Token validation result: " + isValid);
            
            return isValid;
        } catch (Exception e) {
            System.out.println("Error validating token: " + e.getMessage());
            return false;
        }
    }

    public List<String> extractRoles(String token) {
        try {
            Object rolesObj = extractClaim(token, claims -> claims.get("roles"));
            System.out.println("Extracted roles object: " + rolesObj);
            
            if (rolesObj instanceof String) {
                String rolesStr = (String) rolesObj;
                List<String> roles;
                if (rolesStr.contains(",")) {
                    roles = Arrays.asList(rolesStr.split(","));
                } else {
                    roles = List.of(rolesStr);
                }
                System.out.println("Parsed roles from string: " + roles);
                return roles;
            } else if (rolesObj instanceof List) {
                List<String> roles = (List<String>) rolesObj;
                System.out.println("Extracted roles from list: " + roles);
                return roles;
            }
            System.out.println("No roles found in token");
            return new ArrayList<>();
        } catch (Exception e) {
            System.out.println("Error extracting roles: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
} 