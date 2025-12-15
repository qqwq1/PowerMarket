package org.dev.powermarket.web;

import org.dev.powermarket.domain.enums.ServiceCategory;
import org.dev.powermarket.service.ServiceService;
import org.dev.powermarket.service.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services")
public class ServiceController {


    @Autowired
    private ServiceService serviceService;



    @PostMapping
    @Operation(summary = "Создать услугу (только для поставщиков)",
            security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<ServiceDto> createService(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody CreateServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceService.createService(principal.getUsername(), request));
    }

    @PutMapping("/{serviceId}")
    @Operation(summary = "Обновить услугу", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<ServiceDto> updateService(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID serviceId,
            @Valid @RequestBody UpdateServiceRequest request) {
        return ResponseEntity.ok(serviceService.updateService(principal.getUsername(), serviceId, request));
    }

    @GetMapping("/search")
    @Operation(summary = "Поиск услуг")
    public ResponseEntity<Page<ServiceDto>> searchServices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ServiceCategory category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {
        return ResponseEntity.ok(serviceService.searchServices(keyword, category, startDate, endDate, pageable));
    }

    @GetMapping("/{serviceId}")
    @Operation(summary = "Получить услугу по ID")
    public ResponseEntity<ServiceDto> getService(@PathVariable UUID serviceId) {
        return ResponseEntity.ok(serviceService.getService(serviceId));
    }

    @GetMapping("/my")
    @Operation(summary = "Получить мои услуги", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<List<ServiceDto>> getMyServices(@AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(serviceService.getMyServices(principal.getUsername()));
    }

    @DeleteMapping("/{serviceId}")
    @Operation(summary = "Удалить услугу", security = {@SecurityRequirement(name = "bearerAuth")})
    public ResponseEntity<Void> deleteService(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID serviceId) {
        serviceService.deleteService(principal.getUsername(), serviceId);
        return ResponseEntity.noContent().build();
    }
}
