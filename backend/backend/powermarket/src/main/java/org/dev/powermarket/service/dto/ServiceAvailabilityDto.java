package org.dev.powermarket.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceAvailabilityDto {
    private UUID id;
    private LocalDate availableDate;
    private Boolean isReserved;
}
