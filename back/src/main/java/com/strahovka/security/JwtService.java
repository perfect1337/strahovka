package com.strahovka.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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
            .map(authority -> {
                String role = authority.getAuthority();
                // Remove ROLE_ prefix if present
                return role.startsWith("ROLE_") ? role.substring(5) : role;
            })
            .collect(Collectors.joining(","));
        
        System.out.println("Generating token with roles: " + roles);
        extraClaims.put("roles", roles);
        return generateToken(extraClaims, userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        System.out.println("\n=== Generating Token ===");
        System.out.println("User: " + userDetails.getUsername());
        System.out.println("Extra claims: " + extraClaims);
        System.out.println("Original authorities: " + userDetails.getAuthorities());
        
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean usernameMatches = username.equals(userDetails.getUsername());
        boolean tokenNotExpired = !isTokenExpired(token);
        
        System.out.println("Token validation check:");
        System.out.println("Username from token: " + username);
        System.out.println("Username from UserDetails: " + userDetails.getUsername());
        System.out.println("Username matches: " + usernameMatches);
        System.out.println("Token not expired: " + tokenNotExpired);
        
        return usernameMatches && tokenNotExpired;
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        Date now = new Date();
        boolean isExpired = expiration.before(now);
        
        System.out.println("Token expiration check:");
        System.out.println("Expiration date: " + expiration);
        System.out.println("Current date: " + now);
        System.out.println("Is token expired: " + isExpired);
        
        return isExpired;
    }

    private Date extractExpiration(String token) {
        try {
            Date expiration = extractClaim(token, Claims::getExpiration);
            System.out.println("Extracted expiration date: " + expiration);
            return expiration;
        } catch (Exception e) {
            System.out.println("Error extracting expiration date: " + e.getMessage());
            throw e;
        }
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