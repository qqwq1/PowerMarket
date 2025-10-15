package com.powermarket.app.dto;

import jakarta.validation.constraints.NotBlank;

public class RoleSelectionRequest {
    @NotBlank
    private String role;
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}