package org.dev.powermarket.service;

import org.dev.powermarket.domain.CapacityReservation;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.ServiceAvailabilityPeriod;
import org.dev.powermarket.domain.dto.request.AvailablePeriodSearchRequest;
import org.dev.powermarket.domain.dto.response.AvailablePeriodResponse;
import org.dev.powermarket.domain.dto.response.ServiceAvailabilityResponse;
import org.dev.powermarket.domain.enums.AvailabilityStatus;
import org.dev.powermarket.repository.CapacityReservationRepository;
import org.dev.powermarket.repository.ServiceAvailabilityPeriodRepository;
import org.dev.powermarket.repository.ServiceRepository;
import org.dev.powermarket.security.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PeriodAvailabilityServiceTest {

    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private ServiceAvailabilityPeriodRepository periodRepository;
    @Mock
    private CapacityReservationRepository reservationRepository;
    @Mock
    private CapacityManagementService capacityManagementService;

    @InjectMocks
    private PeriodAvailabilityService periodAvailabilityService;

    @Test
    void findAvailablePeriods_whenPeriodHasNoReservations_returnsWholeRange() {
        Service service = buildService(BigDecimal.TEN);
        UUID serviceId = service.getId();
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(2);
        ServiceAvailabilityPeriod availabilityPeriod = buildAvailabilityPeriod(service, start, end);
        AvailablePeriodSearchRequest request =
                new AvailablePeriodSearchRequest(start, end, BigDecimal.valueOf(5));

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findPeriodsInRange(service, start, end)).thenReturn(List.of(availabilityPeriod));
        when(reservationRepository.findOverlappingReservations(service, start, end)).thenReturn(List.of());
        mockDailyCapacity(service, Map.of(
                start, BigDecimal.TEN,
                start.plusDays(1), BigDecimal.TEN,
                end, BigDecimal.TEN
        ));

        List<AvailablePeriodResponse> result = periodAvailabilityService.findAvailablePeriods(serviceId, request);

        assertThat(result).hasSize(1);
        AvailablePeriodResponse period = result.getFirst();
        assertThat(period.periodStart()).isEqualTo(start);
        assertThat(period.periodEnd()).isEqualTo(end);
        assertThat(period.availableCapacity()).isEqualByComparingTo(BigDecimal.TEN);
        assertThat(period.requiredCapacity()).isEqualByComparingTo("5");
        assertThat(period.isFullyAvailable()).isTrue();
    }

    @Test
    void findAvailablePeriods_whenReservationSplitsAvailability_returnsOnlyFreeIntervals() {
        Service service = buildService(BigDecimal.TEN);
        UUID serviceId = service.getId();
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(2);
        ServiceAvailabilityPeriod availabilityPeriod = buildAvailabilityPeriod(service, start, end);
        CapacityReservation reservation = buildReservation(service, start.plusDays(1), start.plusDays(1),
                BigDecimal.valueOf(4), "Tenant");

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findPeriodsInRange(service, start, end)).thenReturn(List.of(availabilityPeriod));
        when(reservationRepository.findOverlappingReservations(service, start, end)).thenReturn(List.of(reservation));
        mockDailyCapacity(service, Map.of(
                start, BigDecimal.TEN,
                start.plusDays(1), BigDecimal.ZERO,
                end, BigDecimal.TEN
        ));

        AvailablePeriodSearchRequest request =
                new AvailablePeriodSearchRequest(start, end, BigDecimal.ONE);
        List<AvailablePeriodResponse> result = periodAvailabilityService.findAvailablePeriods(serviceId, request);

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().periodStart()).isEqualTo(start);
        assertThat(result.getFirst().periodEnd()).isEqualTo(start);
        assertThat(result.get(1).periodStart()).isEqualTo(end);
        assertThat(result.get(1).periodEnd()).isEqualTo(end);
    }

    @Test
    void getServiceAvailability_whenReservationsExist_returnsReservedAndAvailableSegments() {
        Service service = buildService(BigDecimal.TEN);
        UUID serviceId = service.getId();
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(4);
        ServiceAvailabilityPeriod availabilityPeriod = buildAvailabilityPeriod(service, start, end);
        CapacityReservation reservation = buildReservation(service, start.plusDays(1), start.plusDays(2),
                BigDecimal.valueOf(6), "John Tenant");

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findPeriodsInRange(service, start, end)).thenReturn(List.of(availabilityPeriod));
        when(reservationRepository.findOverlappingReservations(service, start, end)).thenReturn(List.of(reservation));
        mockDailyCapacity(service, Map.of(
                start, BigDecimal.valueOf(9),
                start.plusDays(1), BigDecimal.ZERO,
                start.plusDays(2), BigDecimal.ZERO,
                start.plusDays(3), BigDecimal.valueOf(8),
                end, BigDecimal.valueOf(8)
        ));

        ServiceAvailabilityResponse response =
                periodAvailabilityService.getServiceAvailability(serviceId, start, end);

        assertThat(response.serviceId()).isEqualTo(serviceId);
        assertThat(response.availablePeriods()).hasSize(2);
        assertThat(response.availablePeriods().getFirst().startDate()).isEqualTo(start);
        assertThat(response.reservedPeriods()).hasSize(1);
        assertThat(response.reservedPeriods().getFirst().tenantName()).isEqualTo("John Tenant");
        assertThat(response.availabilityStatus()).isEqualTo(AvailabilityStatus.PARTIAL);
    }

    private Service buildService(BigDecimal maxCapacity) {
        Service service = new Service();
        service.setId(UUID.randomUUID());
        service.setTitle("Excavator");
        service.setMaxCapacity(maxCapacity);
        return service;
    }

    private ServiceAvailabilityPeriod buildAvailabilityPeriod(Service service, LocalDate start, LocalDate end) {
        ServiceAvailabilityPeriod period = new ServiceAvailabilityPeriod();
        period.setId(UUID.randomUUID());
        period.setService(service);
        period.setStartDate(start);
        period.setEndDate(end);
        return period;
    }

    private CapacityReservation buildReservation(Service service,
                                                 LocalDate start,
                                                 LocalDate end,
                                                 BigDecimal reservedCapacity,
                                                 String tenantName) {
        CapacityReservation reservation = new CapacityReservation();
        reservation.setId(UUID.randomUUID());
        reservation.setStartDate(start);
        reservation.setEndDate(end);
        reservation.setReservedCapacity(reservedCapacity);

        Rental rental = new Rental();
        rental.setId(UUID.randomUUID());
        User tenant = new User();
        tenant.setId(UUID.randomUUID());
        tenant.setFullName(tenantName);
        rental.setTenant(tenant);
        reservation.setRental(rental);
        return reservation;
    }

    private void mockDailyCapacity(Service service, Map<LocalDate, BigDecimal> capacityByDate) {
        when(capacityManagementService.getAvailableCapacityForDate(eq(service.getId()), any(LocalDate.class)))
                .thenAnswer(invocation -> {
                    LocalDate date = invocation.getArgument(1);
                    return capacityByDate.getOrDefault(date, service.getMaxCapacity());
                });
    }
}
