package com.powermarket.app.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateLotRequest {
    
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;
    
    @Size(max = 50, message = "Unit must not exceed 50 characters")
    private String unit;
    
    @Size(max = 100, message = "Capacity must not exceed 100 characters")
    private String capacity;
    
    @Size(max = 255, message = "Location must not exceed 255 characters")
    private String location;
    
    @Size(max = 255, message = "Contacts must not exceed 255 characters")
    private String contacts;
}
