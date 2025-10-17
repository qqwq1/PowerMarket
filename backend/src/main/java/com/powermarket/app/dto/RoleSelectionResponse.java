package com.powermarket.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RoleSelectionResponse {
    private String role;
    private String sessionId;
    private String message;
}
