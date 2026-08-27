package com.clinic.auth.dto;

import java.util.Set;

public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Boolean enabled;
    private Set<String> roles;

    public UserProfileResponse() {
    }

    public UserProfileResponse(
            Long id,
            String fullName,
            String email,
            String phone,
            Boolean enabled,
            Set<String> roles
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.enabled = enabled;
        this.roles = roles;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public Set<String> getRoles() {
        return roles;
    }
}