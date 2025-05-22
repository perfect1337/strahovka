package com.strahovka.delivery;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.ROLE_USER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserLevel level = UserLevel.WOODEN;

    @Column(name = "policy_count")
    private int policyCount = 0;

    public void incrementPolicyCount() {
        this.policyCount++;
        this.level = UserLevel.getLevelByPolicyCount(this.policyCount);
    }

    public void decrementPolicyCount() {
        if (this.policyCount > 0) {
            this.policyCount--;
            this.level = UserLevel.getLevelByPolicyCount(this.policyCount);
        }
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        System.out.println("=== User Authorities ===");
        System.out.println("User email: " + email);
        System.out.println("Role from entity: " + role.name());
        
        // The role enum already has the ROLE_ prefix, so we use it directly
        String authority = role.name();
        System.out.println("Creating authority: " + authority);
        return List.of(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
} 