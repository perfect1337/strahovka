package com.strahovka.security;

import com.strahovka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("\n=== Loading User Details ===");
        System.out.println("Email: " + email);
        
        try {
            UserDetails userDetails = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден: " + email));
            
            System.out.println("User found: " + userDetails.getUsername());
            System.out.println("Authorities assigned:");
            userDetails.getAuthorities().forEach(auth -> {
                System.out.println("  - " + auth.getAuthority() + " (" + auth.getClass().getSimpleName() + ")");
            });
            System.out.println("Account status:");
            System.out.println("  - Enabled: " + userDetails.isEnabled());
            System.out.println("  - Account Non Expired: " + userDetails.isAccountNonExpired());
            System.out.println("  - Credentials Non Expired: " + userDetails.isCredentialsNonExpired());
            System.out.println("  - Account Non Locked: " + userDetails.isAccountNonLocked());
            System.out.println("=== User Details Loaded ===\n");
            
            return userDetails;
        } catch (UsernameNotFoundException e) {
            System.out.println("User not found: " + email);
            throw e;
        } catch (Exception e) {
            System.out.println("Error loading user: " + e.getMessage());
            throw new UsernameNotFoundException("Error loading user: " + e.getMessage());
        }
    }
} 