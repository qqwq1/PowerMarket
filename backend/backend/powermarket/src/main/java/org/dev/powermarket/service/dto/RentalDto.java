package org.dev.powermarket.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalDto {
    private UUID id;
    private UUID serviceId;
    private String serviceTitle;
    private UUID supplierId;
    private String supplierName;
    private UUID tenantId;
    private String tenantName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private UUID chatId;
    private Instant createdAt;
}
