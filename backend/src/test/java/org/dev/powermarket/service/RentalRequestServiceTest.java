package org.dev.powermarket.service;

import org.dev.powermarket.domain.Chat;
import org.dev.powermarket.domain.Notification;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.RentalRequest;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.enums.NotificationType;
import org.dev.powermarket.domain.enums.RentalRequestStatus;
import org.dev.powermarket.domain.enums.Role;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.CapacityManagementService;
import org.dev.powermarket.repository.ChatRepository;
import org.dev.powermarket.repository.NotificationRepository;
import org.dev.powermarket.repository.RentalRepository;
import org.dev.powermarket.repository.RentalRequestRepository;
import org.dev.powermarket.repository.ServiceRepository;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.service.dto.CreateRentalRequestRequest;
import org.dev.powermarket.service.dto.RentalRequestDto;
import org.dev.powermarket.service.dto.RespondToRentalRequestRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

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
class RentalRequestServiceTest {

    @Mock
    private RentalRequestRepository rentalRequestRepository;
    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private AuthorizedUserRepository userRepository;
    @Mock
    private NotificationRepository notificationRepository;
//    @Mock
//    private EmailService emailService;
    @Mock
    private RentalService rentalService;
    @Mock
    private RentalRepository rentalRepository;
    @Mock
    private ChatRepository chatRepository;
    @Mock
    private CapacityManagementService capacityManagementService;

    @InjectMocks
    private RentalRequestService rentalRequestService;

    private User tenant;
    private User supplier;
    private Service service;

    @BeforeEach
    void setUp() {
        tenant = buildUser(Role.TENANT, "tenant@test.com");
        supplier = buildUser(Role.SUPPLIER, "supplier@test.com");

        service = new Service();
        service.setId(UUID.randomUUID());
        service.setTitle("Excavator");
        service.setIsActive(true);
        service.setPricePerDay(BigDecimal.valueOf(100));
        service.setSupplier(supplier);
    }

    @Test
    void createRentalRequest_whenInputValid_persistsEntitiesAndReturnsDto() {
        CreateRentalRequestRequest request = new CreateRentalRequestRequest();
        request.setServiceId(service.getId());
        request.setStartDate(LocalDate.now());
        request.setEndDate(LocalDate.now().plusDays(2));
        request.setCapacityNeeded(BigDecimal.TEN);

        when(userRepository.findByEmail(tenant.getEmail())).thenReturn(Optional.of(tenant));
        when(serviceRepository.findById(service.getId())).thenReturn(Optional.of(service));
        when(capacityManagementService.isCapacityAvailable(eq(service.getId()), any(), any(), any()))
                .thenReturn(true);
        when(rentalRequestRepository.save(any(RentalRequest.class))).thenAnswer(invocation -> {
            RentalRequest rr = invocation.getArgument(0);
            rr.setId(UUID.randomUUID());
            return rr;
        });
        when(rentalRepository.save(any(Rental.class))).thenAnswer(invocation -> {
            Rental rental = invocation.getArgument(0);
            if (rental.getId() == null) {
                rental.setId(UUID.randomUUID());
            }
            return rental;
        });
        when(chatRepository.save(any(Chat.class))).thenAnswer(invocation -> {
            Chat chat = invocation.getArgument(0);
            chat.setId(UUID.randomUUID());
            return chat;
        });
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalRequestDto dto = rentalRequestService.createRentalRequest(tenant.getEmail(), request);

        assertThat(dto.getTenantId()).isEqualTo(tenant.getId());
        assertThat(dto.getServiceId()).isEqualTo(service.getId());
        assertThat(dto.getStatus()).isEqualTo(RentalRequestStatus.PENDING);
        assertThat(dto.getRentalId()).isNotNull();

        verify(notificationRepository).save(any(Notification.class));
        verify(chatRepository).save(any(Chat.class));
        verify(rentalRepository, times(2)).save(any(Rental.class));
    }

    @Test
    void respondToRequest_whenApproved_createsRentalAndNotification() {
        RentalRequest rentalRequest = buildRentalRequest(RentalRequestStatus.PENDING);
        RespondToRentalRequestRequest request = new RespondToRentalRequestRequest();
        request.setApproved(true);

        when(rentalRequestRepository.findById(rentalRequest.getId())).thenReturn(Optional.of(rentalRequest));
        when(userRepository.findByEmail(supplier.getEmail())).thenReturn(Optional.of(supplier));
        when(rentalRequestRepository.save(any(RentalRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalRequestDto dto = rentalRequestService.respondToRequest(supplier.getEmail(), rentalRequest.getId(), request);

        assertThat(dto.getStatus()).isEqualTo(RentalRequestStatus.IN_CONTRACT);
        assertThat(rentalRequest.getRespondedAt()).isNotNull();
        verify(rentalService).createRentalFromRequest(rentalRequest);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void respondToRequest_whenRejected_setsReasonAndNotifies() {
        RentalRequest rentalRequest = buildRentalRequest(RentalRequestStatus.PENDING);
        RespondToRentalRequestRequest request = new RespondToRentalRequestRequest();
        request.setApproved(false);
        request.setRejectionReason("Busy");

        when(rentalRequestRepository.findById(rentalRequest.getId())).thenReturn(Optional.of(rentalRequest));
        when(userRepository.findByEmail(supplier.getEmail())).thenReturn(Optional.of(supplier));
        when(rentalRequestRepository.save(any(RentalRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RentalRequestDto dto = rentalRequestService.respondToRequest(supplier.getEmail(), rentalRequest.getId(), request);

        assertThat(dto.getStatus()).isEqualTo(RentalRequestStatus.REJECTED);
        assertThat(dto.getRejectionReason()).isEqualTo("Busy");
        verify(rentalService, never()).createRentalFromRequest(any());
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getMyRequests_whenTenant_returnsTenantRequests() {
        RentalRequest request = buildRentalRequest(RentalRequestStatus.PENDING);
        when(userRepository.findByEmail(tenant.getEmail())).thenReturn(Optional.of(tenant));
        when(rentalRequestRepository.findByTenant(eq(tenant), eq(Pageable.unpaged()))).thenReturn(new PageImpl<>(List.of(request)));

        List<RentalRequestDto> dtos = rentalRequestService.getMyRequests(tenant.getEmail());

        assertThat(dtos).hasSize(1);
        assertThat(dtos.getFirst().getTenantId()).isEqualTo(tenant.getId());
    }

    @Test
    void getMyRequests_whenSupplier_returnsSupplierRequests() {
        RentalRequest request = buildRentalRequest(RentalRequestStatus.PENDING);
        when(userRepository.findByEmail(supplier.getEmail())).thenReturn(Optional.of(supplier));
        when(rentalRequestRepository.findBySupplier(eq(supplier), eq(Pageable.unpaged()))).thenReturn(new PageImpl<>(List.of(request)));

        List<RentalRequestDto> dtos = rentalRequestService.getMyRequests(supplier.getEmail());

        assertThat(dtos).hasSize(1);
        assertThat(dtos.getFirst().getServiceTitle()).isEqualTo(service.getTitle());
    }

    @Test
    void getReceivedRequests_returnsSupplierRequests() {
        RentalRequest request = buildRentalRequest(RentalRequestStatus.PENDING);
        when(userRepository.findByEmail(supplier.getEmail())).thenReturn(Optional.of(supplier));
        when(rentalRequestRepository.findBySupplier(eq(supplier), eq(Pageable.unpaged()))).thenReturn(new PageImpl<>(List.of(request)));

        List<RentalRequestDto> dtos = rentalRequestService.getReceivedRequests(supplier.getEmail());

        assertThat(dtos).hasSize(1);
        assertThat(dtos.getFirst().getServiceId()).isEqualTo(service.getId());
    }

    @Test
    void getSentRequests_returnsTenantRequests() {
        RentalRequest request = buildRentalRequest(RentalRequestStatus.PENDING);
        when(userRepository.findByEmail(tenant.getEmail())).thenReturn(Optional.of(tenant));
        when(rentalRequestRepository.findByTenant(eq(tenant), eq(Pageable.unpaged()))).thenReturn(new PageImpl<>(List.of(request)));

        List<RentalRequestDto> dtos = rentalRequestService.getSentRequests(tenant.getEmail());

        assertThat(dtos).hasSize(1);
        assertThat(dtos.getFirst().getTenantEmail()).isEqualTo(tenant.getEmail());
    }

    @Test
    void getRequest_whenUserAuthorized_returnsDto() {
        RentalRequest request = buildRentalRequest(RentalRequestStatus.PENDING);
        when(rentalRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
        when(userRepository.findByEmail(tenant.getEmail())).thenReturn(Optional.of(tenant));

        RentalRequestDto dto = rentalRequestService.getRequest(tenant.getEmail(), request.getId());

        assertThat(dto.getId()).isEqualTo(request.getId());
        assertThat(dto.getServiceTitle()).isEqualTo(service.getTitle());
    }

    private User buildUser(Role role, String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setRole(role);
        user.setEmail(email);
        user.setFullName(email);
        return user;
    }

    private RentalRequest buildRentalRequest(RentalRequestStatus status) {
        RentalRequest rentalRequest = new RentalRequest();
        rentalRequest.setId(UUID.randomUUID());
        rentalRequest.setService(service);
        rentalRequest.setTenant(tenant);
        rentalRequest.setStatus(status);
        rentalRequest.setStartDate(LocalDate.now());
        rentalRequest.setEndDate(LocalDate.now().plusDays(1));
        rentalRequest.setTotalPrice(BigDecimal.valueOf(200));
        rentalRequest.setCapacityNeeded(BigDecimal.ONE);

        Rental rental = new Rental();
        rental.setId(UUID.randomUUID());
        rental.setService(service);
        rentalRequest.setRental(rental);

        return rentalRequest;
    }
}
