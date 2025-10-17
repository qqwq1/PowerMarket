package com.powermarket.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RoleSelectionRequest {
    
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "EXECUTOR|CUSTOMER", message = "Role must be either EXECUTOR or CUSTOMER")
    private String role;
}
