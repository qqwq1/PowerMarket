
package org.dev.powermarket.service;

import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.ServiceAvailabilityPeriod;
import org.dev.powermarket.domain.enums.Role;
import org.dev.powermarket.domain.enums.ServiceCategory;
import org.dev.powermarket.integration.search.MlSearchClient;
import org.dev.powermarket.integration.search.MlSearchProperties;
import org.dev.powermarket.repository.ServiceAvailabilityPeriodRepository;
import org.dev.powermarket.repository.ServiceRepository;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.dto.CreateServiceRequest;
import org.dev.powermarket.service.dto.ServiceDto;
import org.dev.powermarket.service.dto.UpdateServiceRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private ServiceAvailabilityPeriodRepository availabilityPeriodRepository;
    @Mock
    private AuthorizedUserRepository userRepository;
    @Mock
    private MlSearchClient mlSearchClient;
    @Mock
    private MlSearchProperties mlSearchProperties;

    @InjectMocks
    private ServiceService serviceService;

    private User supplier;
    private UUID supplierId;

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();
        supplier = new User();
        supplier.setId(supplierId);
        supplier.setRole(Role.SUPPLIER);
        supplier.setFullName("Test Supplier");
    }

    @Test
    void createService_WhenSupplierExists_PersistsServiceAndAvailabilities() {
        when(userRepository.findByEmail("mail@test.com")).thenReturn(Optional.of(supplier));
        when(serviceRepository.save(any(Service.class))).thenAnswer(invocation -> {
            Service entity = invocation.getArgument(0);
            entity.setId(UUID.randomUUID());
            return entity;
        });

        CreateServiceRequest.AvailabilityPeriod period = new CreateServiceRequest.AvailabilityPeriod();
        period.setStartDate(LocalDate.now());
        period.setEndDate(LocalDate.now().plusDays(5));
        CreateServiceRequest request = new CreateServiceRequest();
        request.setTitle("Title");
        request.setDescription("Desc");
        request.setCategory(ServiceCategory.MANUFACTURING);
        request.setPricePerDay(BigDecimal.TEN);
        request.setLocation("NY");
        request.setMaxCapacity(BigDecimal.TEN);
        request.setTechnicalSpecs("Specs");
        request.setAvailabilities(List.of(period));

        var dto = serviceService.createService("mail@test.com", request);

        assertThat(dto.getTitle()).isEqualTo("Title");
        assertThat(dto.getSupplierId()).isEqualTo(supplierId);

        ArgumentCaptor<Service> serviceCaptor = ArgumentCaptor.forClass(Service.class);
        verify(serviceRepository).save(serviceCaptor.capture());
        assertThat(serviceCaptor.getValue().getSupplier()).isEqualTo(supplier);

        verify(availabilityPeriodRepository, times(1)).save(any(ServiceAvailabilityPeriod.class));
    }

    @Test
    void createService_WhenUserNotSupplier_ThrowsAccessDenied() {
        supplier.setRole(Role.CUSTOMER);
        when(userRepository.findByEmail("mail@test.com")).thenReturn(Optional.of(supplier));

        CreateServiceRequest request = new CreateServiceRequest();
        request.setTitle("Title");

        assertThatThrownBy(() -> serviceService.createService("mail@test.com", request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Only suppliers can create services");

        verify(serviceRepository, times(0)).save(any());
        verify(availabilityPeriodRepository, times(0)).save(any());
    }

    @Test
    void updateService_WhenOwnerUpdatesFields_PersistsChanges() {
        UUID serviceId = UUID.randomUUID();
        Service service = buildService(serviceId, supplier);
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(userRepository.findByEmail("mail@test.com")).thenReturn(Optional.of(supplier));
        when(serviceRepository.save(any(Service.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateServiceRequest request = new UpdateServiceRequest();
        request.setTitle("Updated");
        request.setDescription("Updated desc");
        request.setPricePerDay(BigDecimal.valueOf(200));
        request.setLocation("LA");
        request.setMaxCapacity(BigDecimal.valueOf(50));
        request.setTechnicalSpecs("New specs");
        request.setActive(false);

        ServiceDto dto = serviceService.updateService("mail@test.com", serviceId, request);

        assertThat(dto.getTitle()).isEqualTo("Updated");
        assertThat(service.getPricePerDay()).isEqualByComparingTo("200");
        assertThat(service.getIsActive()).isFalse();
        verify(serviceRepository).save(service);
    }

    @Test
    void updateService_WhenUserNotOwner_ThrowsAccessDenied() {
        UUID serviceId = UUID.randomUUID();
        Service service = buildService(serviceId, supplier);
        User otherUser = new User();
        otherUser.setId(UUID.randomUUID());
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(userRepository.findByEmail("mail@test.com")).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> serviceService.updateService("mail@test.com", serviceId, new UpdateServiceRequest()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("You can only update your own services");

        verify(serviceRepository, times(0)).save(any());
    }

    @Test
    void searchServices_WhenMlSearchEnabledAndKeywordProvided_UsesMlOrdering() {
        String keyword = "robotics";
        Pageable pageable = PageRequest.of(0, 10);
        UUID idA = UUID.randomUUID();
        UUID idB = UUID.randomUUID();
        List<UUID> ids = List.of(idA, idB);
        Service serviceA = buildService(idA, supplier);
        Service serviceB = buildService(idB, supplier);

        when(mlSearchProperties.isEnabled()).thenReturn(true);
        when(mlSearchClient.searchServiceIds(eq(keyword), eq(1), eq(10))).thenReturn(ids);
        when(serviceRepository.findByIdInAndIsActiveTrueAndDeletedFalse(ids)).thenReturn(List.of(serviceB, serviceA));

        Page<ServiceDto> result = serviceService.searchServices(keyword, null, null, null, pageable);

        assertThat(result.getContent()).extracting(ServiceDto::getId).containsExactly(idA, idB);
        verify(serviceRepository, times(0)).searchServices(anyString(), any(Pageable.class));
    }

    @Test
    void searchServices_WhenCategoryProvided_UsesCategoryQuery() {
        Pageable pageable = PageRequest.of(0, 5);
        Service service = buildService(UUID.randomUUID(), supplier);
        when(serviceRepository.findByIsActiveTrueAndCategoryAndDeletedFalse(ServiceCategory.OTHER, pageable))
                .thenReturn(new PageImpl<>(List.of(service)));

        Page<ServiceDto> page = serviceService.searchServices(null, ServiceCategory.OTHER, null, null, pageable);

        assertThat(page.getTotalElements()).isEqualTo(1);
        verify(serviceRepository).findByIsActiveTrueAndCategoryAndDeletedFalse(ServiceCategory.OTHER, pageable);
    }

    @Test
    void getService_WhenFound_ReturnsDto() {
        UUID serviceId = UUID.randomUUID();
        Service service = buildService(serviceId, supplier);
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));

        ServiceDto dto = serviceService.getService(serviceId);

        assertThat(dto.getId()).isEqualTo(serviceId);
    }

    @Test
    void getMyServices_WhenSupplierExists_ReturnsDtos() {
        Service service = buildService(UUID.randomUUID(), supplier);
        when(userRepository.findByEmail("mail@test.com")).thenReturn(Optional.of(supplier));
        when(serviceRepository.findBySupplierAndIsActiveTrueAndDeletedFalse(supplier)).thenReturn(List.of(service));

        List<ServiceDto> services = serviceService.getMyServices("mail@test.com");

        assertThat(services).hasSize(1);
        assertThat(services.get(0).getSupplierId()).isEqualTo(supplierId);
    }

    @Test
    void deleteService_WhenSupplierDeletes_MarksInactiveAndDeleted() {
        UUID serviceId = UUID.randomUUID();
        Service service = buildService(serviceId, supplier);
        when(serviceRepository.findById(serviceId)).thenReturn(Optional.of(service));
        when(userRepository.findByEmail("mail@test.com")).thenReturn(Optional.of(supplier));

        serviceService.deleteService("mail@test.com", serviceId);

        assertThat(service.getIsActive()).isFalse();
        assertThat(service.getDeleted()).isTrue();
        verify(serviceRepository).save(service);
    }

    @Test
    void getAllServices_ReturnsDtos() {
        Service service = buildService(UUID.randomUUID(), supplier);
        when(serviceRepository.findAll()).thenReturn(List.of(service));

        List<ServiceDto> dtos = serviceService.getAllServices();

        assertThat(dtos).hasSize(1);
        assertThat(dtos.getFirst().getId()).isEqualTo(service.getId());
    }

    private Service buildService(UUID id, User supplier) {
        Service service = new Service();
        service.setId(id);
        service.setTitle("Service " + id);
        service.setDescription("Desc");
        service.setCategory(ServiceCategory.OTHER);
        service.setPricePerDay(BigDecimal.valueOf(100));
        service.setLocation("NY");
        service.setMaxCapacity(BigDecimal.TEN);
        service.setTechnicalSpecs("Specs");
        service.setSupplier(supplier);
        service.setIsActive(true);
        service.setDeleted(false);
        return service;
    }
}
