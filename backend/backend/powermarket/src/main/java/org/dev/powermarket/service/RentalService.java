package org.dev.powermarket.service;

import org.dev.powermarket.domain.*;
import org.dev.powermarket.repository.*;
import org.dev.powermarket.service.dto.RentalDto;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ChatRepository chatRepository;
    private final ServiceAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    public RentalService(RentalRepository rentalRepository,
                         ChatRepository chatRepository,
                         ServiceAvailabilityRepository availabilityRepository,
                         UserRepository userRepository) {
        this.rentalRepository = rentalRepository;
        this.chatRepository = chatRepository;
        this.availabilityRepository = availabilityRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createRentalFromRequest(RentalRequest request) {
        // Create rental
        Rental rental = new Rental();
        rental.setRentalRequest(request);
        rental.setService(request.getService());
        rental.setSupplier(request.getService().getSupplier());
        rental.setTenant(request.getTenant());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setTotalPrice(request.getTotalPrice());

        Rental savedRental = rentalRepository.save(rental);

        // Create chat
        Chat chat = new Chat();
        chat.setRental(savedRental);
        Chat savedChat = chatRepository.save(chat);

        savedRental.setChat(savedChat);
        rentalRepository.save(savedRental);

        // Reserve dates in availability calendar
        List<ServiceAvailability> availabilities = availabilityRepository
                .findOverlappingAvailabilities(
                        request.getService(),
                        request.getStartDate(),
                        request.getEndDate()
                );

        for (ServiceAvailability availability : availabilities) {
            availability.setIsReserved(true);
            availabilityRepository.save(availability);
        }

    }

    @Transactional(readOnly = true)
    public List<RentalDto> getMyRentals(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Rental> rentals = rentalRepository.findBySupplierOrTenant(user, user);
        return rentals.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RentalDto getRental(String email, UUID rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new IllegalArgumentException("Rental not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isAuthorized = rental.getSupplier().getId().equals(user.getId()) ||
                rental.getTenant().getId().equals(user.getId());

        if (!isAuthorized) {
            throw new AccessDeniedException("You don't have access to this rental");
        }

        return toDto(rental);
    }

    private RentalDto toDto(Rental rental) {
        RentalDto dto = new RentalDto();
        dto.setId(rental.getId());
        dto.setServiceId(rental.getService().getId());
        dto.setServiceTitle(rental.getService().getTitle());
        dto.setSupplierId(rental.getSupplier().getId());
        dto.setSupplierName(rental.getSupplier().getFullName());
        dto.setTenantId(rental.getTenant().getId());
        dto.setTenantName(rental.getTenant().getFullName());
        dto.setStartDate(rental.getStartDate());
        dto.setEndDate(rental.getEndDate());
        dto.setTotalPrice(rental.getTotalPrice());
        dto.setChatId(rental.getChat() != null ? rental.getChat().getId() : null);
        dto.setCreatedAt(rental.getCreatedAt());
        return dto;
    }
}
