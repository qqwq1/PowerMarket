package org.dev.powermarket.service;

import org.dev.powermarket.domain.Chat;
import org.dev.powermarket.domain.Notification;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.RentalRequest;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.enums.NotificationType;
import org.dev.powermarket.domain.enums.RentalRequestStatus;
import org.dev.powermarket.repository.ChatRepository;
import org.dev.powermarket.repository.NotificationRepository;
import org.dev.powermarket.repository.RentalRepository;
import org.dev.powermarket.repository.RentalRequestRepository;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.dto.RentalDto;
import org.dev.powermarket.service.dto.RentalStatsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;
    @Mock
    private ChatRepository chatRepository;
    @Mock
    private AuthorizedUserRepository userRepository;
    @Mock
    private RentalRequestRepository rentalRequestRepository;
    @Mock
    private NotificationRepository notificationRepository;
    @Mock
    private CapacityManagementService capacityManagementService;

    @InjectMocks
    private RentalService rentalService;

    private Rental baseRental;
    private RentalRequest baseRequest;
    private Service service;
    private User supplier;
    private User tenant;
    private UUID rentalId;

    @BeforeEach
    void init() {
        rentalId = UUID.randomUUID();
        service = new Service();
        service.setId(UUID.randomUUID());
        service.setTitle("Test service");
        service.setMaxCapacity(BigDecimal.valueOf(20));

        supplier = buildUser("Supplier");
        tenant = buildUser("Tenant");
        service.setSupplier(supplier);

        baseRequest = new RentalRequest();
        baseRequest.setId(UUID.randomUUID());
        baseRequest.setService(service);
        baseRequest.setTenant(tenant);
        baseRequest.setStartDate(LocalDate.now());
        baseRequest.setEndDate(LocalDate.now());
        baseRequest.setCapacityNeeded(BigDecimal.TEN);
        baseRequest.setStatus(RentalRequestStatus.IN_CONTRACT);

        baseRental = new Rental();
        baseRental.setId(rentalId);
        baseRental.setService(service);
        baseRental.setSupplier(supplier);
        baseRental.setTenant(tenant);
        baseRental.setRentalRequest(baseRequest);
        baseRental.setStartDate(LocalDate.now());
        baseRental.setEndDate(LocalDate.now());
        baseRental.setTotalPrice(BigDecimal.valueOf(100));
        baseRental.setCapacityNeeded(BigDecimal.TEN);
        baseRental.setIsActive(true);
    }

    @Test
    void createRentalFromRequest_whenRentalMissing_createsRentalAndChat() {
        RentalRequest request = buildStandaloneRequest();
        when(rentalRepository.findByRentalRequest(request)).thenReturn(Optional.empty());
        when(rentalRepository.save(any(Rental.class))).thenAnswer(inv -> {
            Rental rental = inv.getArgument(0);
            if (rental.getId() == null) {
                rental.setId(UUID.randomUUID());
            }
            return rental;
        });
        when(chatRepository.findByRental(any(Rental.class))).thenReturn(Optional.empty());
        when(chatRepository.save(any(Chat.class))).thenAnswer(inv -> {
            Chat chat = inv.getArgument(0);
            chat.setId(UUID.randomUUID());
            return chat;
        });

        rentalService.createRentalFromRequest(request);

        assertThat(request.getStatus()).isEqualTo(RentalRequestStatus.IN_CONTRACT);
        verify(rentalRepository, atLeastOnce()).save(any(Rental.class));
        verify(chatRepository).save(any(Chat.class));
        verify(rentalRequestRepository).save(request);
    }

    @Test
    void confirmRental_whenSupplierConfirmsFirst_setsSupplierFlagAndSendsNotification() {
        baseRental.setSupplierConfirmed(false);
        baseRental.setTenantConfirmed(false);

        when(rentalRepository.findById(rentalId)).thenReturn(Optional.of(baseRental));
        when(userRepository.findByEmail("supplier@test.com")).thenReturn(Optional.of(supplier));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalDto dto = rentalService.confirmRental("supplier@test.com", rentalId);

        assertThat(dto.getSupplierConfirmed()).isTrue();
        assertThat(dto.getTenantConfirmed()).isFalse();
        assertThat(baseRental.getSupplierConfirmedAt()).isNotNull();

        ArgumentCaptor<Notification> notificationCaptor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(notificationCaptor.capture());
        Notification notification = notificationCaptor.getValue();
        assertThat(notification.getUser().getId()).isEqualTo(tenant.getId());
        assertThat(notification.getType()).isEqualTo(NotificationType.REQUEST_APPROVED);

        verify(capacityManagementService, never()).reserveCapacity(any(), any(), any(), any());
        verify(rentalRequestRepository, never()).save(baseRequest);
    }

    @Test
    void confirmRental_whenTenantConfirmsAfterSupplier_updatesStatusAndReservesCapacity() {
        baseRental.setSupplierConfirmed(true);
        baseRental.setSupplierConfirmedAt(Instant.now());
        baseRental.setTenantConfirmed(false);

        when(rentalRepository.findById(rentalId)).thenReturn(Optional.of(baseRental));
        when(userRepository.findByEmail("tenant@test.com")).thenReturn(Optional.of(tenant));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalDto dto = rentalService.confirmRental("tenant@test.com", rentalId);

        assertThat(dto.getSupplierConfirmed()).isTrue();
        assertThat(dto.getTenantConfirmed()).isTrue();
        assertThat(baseRequest.getStatus()).isEqualTo(RentalRequestStatus.CONFIRMED);

        verify(rentalRequestRepository).save(baseRequest);
        verify(capacityManagementService).reserveCapacity(
                eq(baseRental),
                eq(baseRequest.getStartDate()),
                eq(baseRequest.getEndDate()),
                eq(baseRequest.getCapacityNeeded())
        );
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void startRental_whenConfirmedAndStartDateArrived_switchesRequestToInRent() {
        baseRequest.setStatus(RentalRequestStatus.CONFIRMED);
        when(rentalRepository.findById(rentalId)).thenReturn(Optional.of(baseRental));

        RentalDto dto = rentalService.startRental(rentalId);

        assertThat(baseRequest.getStatus()).isEqualTo(RentalRequestStatus.IN_RENT);
        assertThat(dto.getStatus()).isEqualTo(RentalRequestStatus.IN_RENT);
        verify(rentalRequestRepository).save(baseRequest);
    }

    @Test
    void completeRental_whenInRentAndEnded_releasesCapacityAndSendsNotifications() {
        baseRequest.setStatus(RentalRequestStatus.IN_RENT);
        baseRental.setEndDate(LocalDate.now());
        when(rentalRepository.findById(rentalId)).thenReturn(Optional.of(baseRental));
        when(rentalRepository.save(any(Rental.class))).thenAnswer(inv -> inv.getArgument(0));

        RentalDto dto = rentalService.completeRental(rentalId);

        assertThat(baseRequest.getStatus()).isEqualTo(RentalRequestStatus.COMPLETED);
        assertThat(baseRental.getIsActive()).isFalse();
        assertThat(dto.getStatus()).isEqualTo(RentalRequestStatus.COMPLETED);
        verify(rentalRepository).save(baseRental);
        verify(rentalRequestRepository).save(baseRequest);
        verify(capacityManagementService).releaseCapacity(baseRental);
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void getMyRentals_whenUserExists_returnsMappedDtos() {
        when(userRepository.findByEmail("supplier@test.com")).thenReturn(Optional.of(supplier));
        when(rentalRepository.findBySupplierOrTenant(supplier, supplier)).thenReturn(List.of(baseRental));

        var rentals = rentalService.getMyRentals("supplier@test.com");

        assertThat(rentals).hasSize(1);
        assertThat(rentals.getFirst().getId()).isEqualTo(baseRental.getId());
    }

    @Test
    void getRentalStats_aggregatesTotalsAndRevenue() {
        supplier.setAverageRating(BigDecimal.valueOf(4.5));
        List<Rental> rentals = List.of(
                buildRentalWithStatus(RentalRequestStatus.CONFIRMED, BigDecimal.valueOf(150), true),
                buildRentalWithStatus(RentalRequestStatus.IN_RENT, BigDecimal.valueOf(200), true),
                buildRentalWithStatus(RentalRequestStatus.COMPLETED, BigDecimal.valueOf(300), false)
        );
        when(userRepository.findByEmail("supplier@test.com")).thenReturn(Optional.of(supplier));
        when(rentalRepository.findBySupplierOrTenant(supplier, supplier)).thenReturn(rentals);

        RentalStatsDto stats = rentalService.getRentalStats("supplier@test.com");

        assertThat(stats.getTotalRentals()).isEqualTo(3);
        assertThat(stats.getActiveRentals()).isEqualTo(2);
        assertThat(stats.getCompletedRentals()).isEqualTo(1);
        assertThat(stats.getTotalRevenue()).isEqualByComparingTo("300");
        assertThat(stats.getAverageRating()).isEqualByComparingTo("4.5");
    }

    @Test
    void getRental_whenUserParticipates_returnsDto() {
        when(rentalRepository.findById(rentalId)).thenReturn(Optional.of(baseRental));
        when(userRepository.findByEmail("supplier@test.com")).thenReturn(Optional.of(supplier));

        RentalDto dto = rentalService.getRental("supplier@test.com", rentalId);

        assertThat(dto.getId()).isEqualTo(rentalId);
        assertThat(dto.getSupplierId()).isEqualTo(supplier.getId());
    }

    private User buildUser(String name) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setFullName(name);
        user.setEmail(name.toLowerCase() + "@test.com");
        return user;
    }

    private RentalRequest buildStandaloneRequest() {
        Service standaloneService = new Service();
        standaloneService.setId(UUID.randomUUID());
        standaloneService.setTitle("Standalone service");
        standaloneService.setSupplier(buildUser("StandaloneSupplier"));
        standaloneService.setMaxCapacity(BigDecimal.valueOf(40));

        User standaloneTenant = buildUser("StandaloneTenant");

        RentalRequest request = new RentalRequest();
        request.setId(UUID.randomUUID());
        request.setService(standaloneService);
        request.setTenant(standaloneTenant);
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(1));
        request.setCapacityNeeded(BigDecimal.valueOf(5));
        request.setTotalPrice(BigDecimal.valueOf(500));
        request.setStatus(RentalRequestStatus.PENDING);
        return request;
    }

    private Rental buildRentalWithStatus(RentalRequestStatus status, BigDecimal totalPrice, boolean isActive) {
        RentalRequest request = new RentalRequest();
        request.setId(UUID.randomUUID());
        request.setService(service);
        request.setTenant(tenant);
        request.setStartDate(LocalDate.now().minusDays(3));
        request.setEndDate(LocalDate.now().minusDays(1));
        request.setCapacityNeeded(BigDecimal.ONE);
        request.setStatus(status);
        request.setTotalPrice(totalPrice);

        Rental rental = new Rental();
        rental.setId(UUID.randomUUID());
        rental.setService(service);
        rental.setSupplier(supplier);
        rental.setTenant(tenant);
        rental.setRentalRequest(request);
        rental.setTotalPrice(totalPrice);
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setIsActive(isActive);
        return rental;
    }
}
