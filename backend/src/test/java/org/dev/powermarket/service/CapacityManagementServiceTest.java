package org.dev.powermarket.service;

import org.dev.powermarket.domain.CapacityReservation;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.ServiceAvailabilityPeriod;
import org.dev.powermarket.repository.CapacityReservationRepository;
import org.dev.powermarket.repository.ServiceAvailabilityPeriodRepository;
import org.dev.powermarket.repository.ServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CapacityManagementServiceTest {

    @Mock
    private ServiceAvailabilityPeriodRepository periodRepository;
    @Mock
    private CapacityReservationRepository reservationRepository;
    @Mock
    private ServiceRepository serviceRepository;

    @Spy
    @InjectMocks
    private CapacityManagementService capacityManagementService;

    @Test
    void reserveCapacity_whenCapacityAvailable_savesSingleReservation() {
        UUID serviceId = UUID.randomUUID();
        Rental rental = new Rental();
        Service service = new Service();
        service.setId(serviceId);
        rental.setService(service);
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(2);
        BigDecimal capacity = BigDecimal.valueOf(4);

        doReturn(true).when(capacityManagementService)
                .isCapacityAvailable(serviceId, start, end, capacity);

        capacityManagementService.reserveCapacity(rental, start, end, capacity);

        ArgumentCaptor<CapacityReservation> captor = ArgumentCaptor.forClass(CapacityReservation.class);
        verify(reservationRepository).save(captor.capture());
        CapacityReservation saved = captor.getValue();
        assertThat(saved.getRental()).isEqualTo(rental);
        assertThat(saved.getStartDate()).isEqualTo(start);
        assertThat(saved.getEndDate()).isEqualTo(end);
        assertThat(saved.getReservedCapacity()).isEqualByComparingTo(capacity);
    }

    @Test
    void reserveCapacity_whenCapacityUnavailable_throwsException() {
        UUID serviceId = UUID.randomUUID();
        Rental rental = new Rental();
        Service service = new Service();
        service.setId(serviceId);
        rental.setService(service);
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(1);
        BigDecimal capacity = BigDecimal.valueOf(6);

        doReturn(false).when(capacityManagementService)
                .isCapacityAvailable(serviceId, start, end, capacity);

        assertThatThrownBy(() -> capacityManagementService.reserveCapacity(rental, start, end, capacity))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Not enough capacity");
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void releaseCapacity_deletesAllReservationsForRental() {
        Rental rental = new Rental();
        List<CapacityReservation> reservations = List.of(new CapacityReservation());

        when(reservationRepository.findByRental(rental)).thenReturn(reservations);

        capacityManagementService.releaseCapacity(rental);

        verify(reservationRepository).deleteAll(reservations);
    }

    @Test
    void getAvailableCapacityForDate_whenPeriodExists_returnsRemainingCapacity() {
        UUID serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.of(2024, 5, 10);
        Service service = new Service();
        service.setId(serviceId);
        ServiceAvailabilityPeriod period = new ServiceAvailabilityPeriod();
        period.setTotalCapacity(BigDecimal.TEN);

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findByServiceAndDate(service, date)).thenReturn(Optional.of(period));
        when(reservationRepository.getReservedCapacityForDate(service, date))
                .thenReturn(BigDecimal.valueOf(3));

        BigDecimal available = capacityManagementService.getAvailableCapacityForDate(serviceId, date);

        assertThat(available).isEqualByComparingTo("7");
    }

    @Test
    void getAvailableCapacityForDate_whenPeriodMissing_returnsZero() {
        UUID serviceId = UUID.randomUUID();
        LocalDate date = LocalDate.now();
        Service service = new Service();
        service.setId(serviceId);

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findByServiceAndDate(service, date)).thenReturn(Optional.empty());

        BigDecimal available = capacityManagementService.getAvailableCapacityForDate(serviceId, date);

        assertThat(available).isZero();
        verify(reservationRepository, never()).getReservedCapacityForDate(any(), any());
    }

    @Test
    void isCapacityAvailable_whenAllDaysSatisfyRequirement_returnsTrue() {
        UUID serviceId = UUID.randomUUID();
        LocalDate start = LocalDate.of(2024, 6, 1);
        LocalDate end = start.plusDays(1);
        BigDecimal required = BigDecimal.valueOf(5);
        Service service = new Service();
        service.setId(serviceId);

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findOverlappingPeriods(service, start, end))
                .thenReturn(List.of(new ServiceAvailabilityPeriod()));
        doReturn(BigDecimal.valueOf(6)).when(capacityManagementService)
                .getAvailableCapacityForDate(eq(serviceId), any(LocalDate.class));

        boolean result = capacityManagementService.isCapacityAvailable(serviceId, start, end, required);

        assertThat(result).isTrue();
    }

    @Test
    void isCapacityAvailable_whenAnyDayHasInsufficientCapacity_returnsFalse() {
        UUID serviceId = UUID.randomUUID();
        LocalDate start = LocalDate.of(2024, 7, 1);
        LocalDate end = start.plusDays(1);
        BigDecimal required = BigDecimal.valueOf(5);
        Service service = new Service();
        service.setId(serviceId);

        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(periodRepository.findOverlappingPeriods(service, start, end))
                .thenReturn(List.of(new ServiceAvailabilityPeriod()));
        doReturn(BigDecimal.valueOf(6), BigDecimal.valueOf(4))
                .when(capacityManagementService)
                .getAvailableCapacityForDate(eq(serviceId), any(LocalDate.class));

        boolean result = capacityManagementService.isCapacityAvailable(serviceId, start, end, required);

        assertThat(result).isFalse();
    }
}
