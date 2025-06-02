package com.strahovka.delivery;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Data
@Builder
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

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "phone")
    private String phone;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String password;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "access_token")
    private String accessToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", nullable = false)
    @Builder.Default
    private UserLevel level = UserLevel.WOODEN;

    @Column(name = "policy_count")
    @Builder.Default
    private Integer policyCount = 0;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        System.out.println("=== User Authorities ===");
        System.out.println("User email: " + email);
        System.out.println("Role from entity: " + role.name());
        
        String authority = role.name();
        System.out.println("Creating authority: " + authority);
        return List.of(new SimpleGrantedAuthority(authority));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
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
} 