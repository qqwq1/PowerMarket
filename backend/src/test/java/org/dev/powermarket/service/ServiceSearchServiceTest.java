package org.dev.powermarket.service;

import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.enums.AvailabilityStatus;
import org.dev.powermarket.domain.enums.ServiceCategory;
import org.dev.powermarket.domain.dto.request.ServiceSearchByCategoryRequest;
import org.dev.powermarket.domain.dto.response.ServiceSearchResultResponse;
import org.dev.powermarket.repository.ServiceRepository;
import org.dev.powermarket.security.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceSearchServiceTest {

    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private CapacityManagementService capacityManagementService;
    @Mock
    private PeriodAvailabilityService periodAvailabilityService;

    @InjectMocks
    private ServiceSearchService serviceSearchService;

    @Test
    void searchServicesByCategoryAndCapacity_WithDates_EnrichesResponseAndUsesAvailabilityQuery() {
        Service service = buildService(BigDecimal.valueOf(100));
        ServiceSearchByCategoryRequest request = new ServiceSearchByCategoryRequest(
                ServiceCategory.OTHER,
                BigDecimal.valueOf(20),
                LocalDate.now(),
                LocalDate.now().plusDays(2),
                0,
                5
        );
        PageRequest pageRequest = PageRequest.of(request.page(), request.size());
        when(serviceRepository.findAvailableServicesByCategoryAndCapacity(
                request.category(),
                request.minCapacity(),
                request.availableFrom(),
                request.availableTo(),
                pageRequest
        )).thenReturn(new PageImpl<>(List.of(service)));
        when(capacityManagementService.getAvailableCapacityForDate(eq(service.getId()), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(40));
        when(capacityManagementService.isCapacityAvailable(
                service.getId(),
                request.availableFrom(),
                request.availableTo(),
                request.minCapacity()
        )).thenReturn(true);

        Page<ServiceSearchResultResponse> page = serviceSearchService.searchServicesByCategoryAndCapacity(request);

        assertThat(page.getTotalElements()).isEqualTo(1);
        ServiceSearchResultResponse response = page.getContent().get(0);
        assertThat(response.availabilityStatus()).isEqualTo(AvailabilityStatus.PARTIAL);
        assertThat(response.isAvailableForRequestedDates()).isTrue();
        verify(serviceRepository).findAvailableServicesByCategoryAndCapacity(
                request.category(),
                request.minCapacity(),
                request.availableFrom(),
                request.availableTo(),
                pageRequest
        );
        verify(capacityManagementService).isCapacityAvailable(
                service.getId(),
                request.availableFrom(),
                request.availableTo(),
                request.minCapacity()
        );
    }

    @Test
    void searchServicesByCategoryAndCapacity_WithoutDates_UsesBasicQuery() {
        Service service = buildService(BigDecimal.valueOf(75));
        ServiceSearchByCategoryRequest request = new ServiceSearchByCategoryRequest(
                ServiceCategory.OTHER,
                BigDecimal.TEN,
                null,
                null,
                1,
                10
        );
        PageRequest pageRequest = PageRequest.of(request.page(), request.size());
        when(serviceRepository.findByCategoryAndMinCapacity(
                request.category(),
                request.minCapacity(),
                pageRequest
        )).thenReturn(new PageImpl<>(List.of(service)));
        when(capacityManagementService.getAvailableCapacityForDate(eq(service.getId()), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(75));

        Page<ServiceSearchResultResponse> page = serviceSearchService.searchServicesByCategoryAndCapacity(request);

        assertThat(page.getContent()).hasSize(1);
        ServiceSearchResultResponse response = page.getContent().get(0);
        assertThat(response.availabilityStatus()).isEqualTo(AvailabilityStatus.AVAILABLE);
        assertThat(response.isAvailableForRequestedDates()).isNull();
        verify(serviceRepository).findByCategoryAndMinCapacity(
                request.category(),
                request.minCapacity(),
                pageRequest
        );
        verify(capacityManagementService, never()).isCapacityAvailable(any(), any(), any(), any());
    }

    @Test
    void findTopServicesByCategoryAndCapacity_SortsByAvailabilityAndLimitsResult() {
        ServiceCategory category = ServiceCategory.OTHER;
        BigDecimal minCapacity = BigDecimal.valueOf(5);
        int limit = 1;
        Service highAvailability = buildService(BigDecimal.valueOf(100));
        Service lowAvailability = buildService(BigDecimal.valueOf(80));
        PageRequest expectedPageable = PageRequest.of(0, 50);

        when(serviceRepository.findByCategoryAndMinCapacity(category, minCapacity, expectedPageable))
                .thenReturn(new PageImpl<>(List.of(lowAvailability, highAvailability)));
        when(capacityManagementService.getAvailableCapacityForDate(eq(highAvailability.getId()), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(80));
        when(capacityManagementService.getAvailableCapacityForDate(eq(lowAvailability.getId()), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(20));

        List<ServiceSearchResultResponse> responses =
                serviceSearchService.findTopServicesByCategoryAndCapacity(category, minCapacity, limit);

        assertThat(responses).hasSize(1);
        assertThat(responses.getFirst().id()).isEqualTo(highAvailability.getId());
        verify(serviceRepository).findByCategoryAndMinCapacity(category, minCapacity, expectedPageable);
    }

    @Test
    void findServicesGroupedByAvailability_ReturnsMapSplitByStatus() {
        ServiceCategory category = ServiceCategory.MANUFACTURING;
        BigDecimal minCapacity = BigDecimal.ONE;
        Service unavailable = buildService(BigDecimal.valueOf(60));
        Service partial = buildService(BigDecimal.valueOf(90));

        when(serviceRepository.findByCategoryAndMinCapacity(category, minCapacity, Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(unavailable, partial)));
        when(capacityManagementService.getAvailableCapacityForDate(eq(unavailable.getId()), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);
        when(capacityManagementService.getAvailableCapacityForDate(eq(partial.getId()), any(LocalDate.class)))
                .thenReturn(BigDecimal.valueOf(30));

        Map<AvailabilityStatus, List<ServiceSearchResultResponse>> grouped =
                serviceSearchService.findServicesGroupedByAvailability(category, minCapacity);

        assertThat(grouped.get(AvailabilityStatus.UNAVAILABLE))
                .extracting(ServiceSearchResultResponse::id)
                .containsExactly(unavailable.getId());
        assertThat(grouped.get(AvailabilityStatus.PARTIAL))
                .extracting(ServiceSearchResultResponse::id)
                .containsExactly(partial.getId());
        verify(serviceRepository).findByCategoryAndMinCapacity(category, minCapacity, Pageable.unpaged());
    }

    private Service buildService(BigDecimal maxCapacity) {
        Service service = new Service();
        service.setId(UUID.randomUUID());
        service.setTitle("Test Service");
        service.setDescription("Description");
        service.setCategory(ServiceCategory.OTHER);
        service.setPricePerDay(BigDecimal.valueOf(500));
        service.setMaxCapacity(maxCapacity);
        service.setLocation("NY");
        service.setTechnicalSpecs("Specs");
        service.setIsActive(true);

        User supplier = new User();
        supplier.setId(UUID.randomUUID());
        supplier.setFullName("Supplier");
        service.setSupplier(supplier);

        return service;
    }
}
