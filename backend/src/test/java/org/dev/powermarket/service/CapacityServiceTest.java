package org.dev.powermarket.service;

import org.dev.powermarket.domain.CapacityReservation;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.ServiceAvailabilityPeriod;
import org.dev.powermarket.domain.dto.response.CapacityAvailabilityResponse;
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
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CapacityServiceTest {

    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private ServiceAvailabilityPeriodRepository periodRepository;
    @Mock
    private CapacityReservationRepository reservationRepository;

    @InjectMocks
    private CapacityService capacityService;

    @Test
    void getCapacityAvailability_whenPeriodExists_buildsResponsePerDay() {
        UUID serviceId = UUID.randomUUID();
        Service service = new Service();
        LocalDate date = LocalDate.of(2024, 1, 1);
        ServiceAvailabilityPeriod period = new ServiceAvailabilityPeriod();
        period.setTotalCapacity(BigDecimal.TEN);

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findByServiceAndDate(service, date)).thenReturn(Optional.of(period));
        when(reservationRepository.getReservedCapacityForDate(service, date)).thenReturn(BigDecimal.valueOf(3));

        User tenant = new User();
        tenant.setFullName("John Doe");
        Rental rental = new Rental();
        rental.setTenant(tenant);
        rental.setStartDate(date);
        rental.setEndDate(date.plusDays(1));

        CapacityReservation reservation = new CapacityReservation();
        reservation.setRental(rental);
        reservation.setReservedCapacity(BigDecimal.valueOf(3));

        when(reservationRepository.findByServiceAndDateRange(service, date, date))
                .thenReturn(List.of(reservation));

        List<CapacityAvailabilityResponse> responses =
                capacityService.getCapacityAvailability(serviceId, date, date);

        assertThat(responses).hasSize(1);
        CapacityAvailabilityResponse response = responses.getFirst();
        assertThat(response.date()).isEqualTo(date);
        assertThat(response.totalCapacity()).isEqualByComparingTo("10");
        assertThat(response.availableCapacity()).isEqualByComparingTo("7");
        assertThat(response.reservedCapacity()).isEqualByComparingTo("3");
        CapacityAvailabilityResponse.OccupiedSlot slot = response.occupiedSlots().getFirst();
        assertThat(slot.startDate()).isEqualTo(date);
        assertThat(slot.endDate()).isEqualTo(date.plusDays(1));
        assertThat(slot.tenantName()).isEqualTo("John Doe");
        assertThat(slot.reservedCapacity()).isEqualByComparingTo("3");

        verify(serviceRepository).findById(serviceId);
        verify(periodRepository).findByServiceAndDate(service, date);
        verify(reservationRepository).getReservedCapacityForDate(service, date);
        verify(reservationRepository).findByServiceAndDateRange(service, date, date);
    }

    @Test
    void getCapacityAvailability_whenNoPeriod_returnsZeroCapacities() {
        UUID serviceId = UUID.randomUUID();
        Service service = new Service();
        LocalDate start = LocalDate.of(2024, 1, 1);
        LocalDate end = start.plusDays(1);

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findByServiceAndDate(eq(service), any(LocalDate.class)))
                .thenReturn(Optional.empty());

        List<CapacityAvailabilityResponse> responses =
                capacityService.getCapacityAvailability(serviceId, start, end);

        assertThat(responses).hasSize(2);
        assertThat(responses).allSatisfy(response -> {
            assertThat(response.totalCapacity()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(response.availableCapacity()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(response.reservedCapacity()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(response.occupiedSlots()).isEmpty();
        });

        verify(reservationRepository, never()).getReservedCapacityForDate(any(), any());
        verify(reservationRepository, never()).findByServiceAndDateRange(any(), any(), any());
    }
}
