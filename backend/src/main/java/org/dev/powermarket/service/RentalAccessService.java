package org.dev.powermarket.service;

import lombok.RequiredArgsConstructor;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.exception.RentalNotFoundException;
import org.dev.powermarket.repository.RentalRepository;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RentalAccessService {

    private final RentalRepository rentalRepository;
    private final AuthorizedUserRepository userRepository;

    /**
     * Проверяет доступ пользователя к аренде и возвращает аренду, если доступ есть
     */
    public Rental getRentalWithAccessCheck(UUID rentalId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException(
                        String.format("Не найдена Аренда по Rental id %s", rentalId)));

        checkUserRelatedToRental(user.getId(), rental);
        return rental;
    }

    /**
     * Проверяет доступ пользователя к аренде и возвращает аренду, если доступ есть
     */
    public Rental getRentalWithAccessCheck(UUID rentalId, UUID userId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RentalNotFoundException(
                        String.format("Не найдена Аренда по Rental id %s", rentalId)));

        checkUserRelatedToRental(userId, rental);
        return rental;
    }

    /**
     * Проверяет, связан ли пользователь с арендой
     */
    public void checkUserRelatedToRental(UUID userId, Rental rental) {
        boolean isSupplier = rental.getSupplier() != null &&
                rental.getSupplier().getId().equals(userId);

        boolean isTenant = rental.getTenant() != null &&
                rental.getTenant().getId().equals(userId);

        if (!(isSupplier || isTenant)) {
            throw new AccessDeniedException("Доступ запрещен. Вы не являетесь участником этого контракта");
        }
    }

    /**
     * Проверяет, связан ли пользователь с арендой (статическая версия для удобства)
     */
    public static boolean isUserRelatedToRental(UUID userId, Rental rental) {
        boolean isSupplier = rental.getSupplier() != null &&
                rental.getSupplier().getId().equals(userId);

        boolean isTenant = rental.getTenant() != null &&
                rental.getTenant().getId().equals(userId);

        return isSupplier || isTenant;
    }
}
