package com.strahovka.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
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
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            System.out.println("Error extracting username from token: " + e.getMessage());
            return null;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        try {
            Map<String, Object> claims = new HashMap<>();
            String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
            
            System.out.println("\n=== Generating Token ===");
            System.out.println("User: " + userDetails.getUsername());
            System.out.println("Roles: " + roles);
            
            claims.put("roles", roles);
            
            Date now = new Date();
            Date expiration = new Date(now.getTime() + jwtExpiration);
            
            String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
                
            System.out.println("Token generated successfully");
            System.out.println("Token expiration: " + expiration);
            
            // Verify the token immediately after generation
            try {
                Claims verificationClaims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
                System.out.println("Token verification successful");
                System.out.println("Verified claims: " + verificationClaims);
            } catch (Exception e) {
                System.out.println("Token verification failed: " + e.getMessage());
                throw new RuntimeException("Generated token is invalid", e);
            }
            
            return token;
        } catch (Exception e) {
            System.out.println("Error generating token: " + e.getMessage());
            throw e;
        }
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            if (username == null) {
                System.out.println("Token validation failed: username is null");
                return false;
            }

            Claims claims = extractAllClaims(token);
            Date expiration = claims.getExpiration();
            Date now = new Date();
            
            System.out.println("\n=== Token Validation ===");
            System.out.println("Token username: " + username);
            System.out.println("UserDetails username: " + userDetails.getUsername());
            System.out.println("Token expiration: " + expiration);
            System.out.println("Current time: " + now);
            System.out.println("Token roles: " + claims.get("roles"));
            System.out.println("UserDetails roles: " + userDetails.getAuthorities());
            
            if (expiration.before(now)) {
                System.out.println("Token validation failed: token is expired");
                return false;
            }
            
            if (!username.equals(userDetails.getUsername())) {
                System.out.println("Token validation failed: username mismatch");
                return false;
            }
            
            System.out.println("Token validation successful");
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired: " + e.getMessage());
            return false;
        } catch (SignatureException e) {
            System.out.println("Invalid token signature: " + e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            System.out.println("Malformed token: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.out.println("Error validating token: " + e.getMessage());
            return false;
        }
    }

    public List<String> extractRoles(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Object rolesObj = claims.get("roles");
            System.out.println("Extracted roles object: " + rolesObj);
            
            if (rolesObj instanceof String) {
                String rolesStr = (String) rolesObj;
                List<String> roles = new ArrayList<>();
                if (rolesStr.contains(",")) {
                    roles.addAll(Arrays.asList(rolesStr.split(",")));
                } else {
                    roles.add(rolesStr);
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
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        try {
            Date expiration = extractExpiration(token);
            return expiration != null && expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            System.out.println("Token is expired: " + e.getMessage());
            return true;
        } catch (Exception e) {
            System.out.println("Error checking token expiration: " + e.getMessage());
            return true;
        }
    }

    private Key getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
} 