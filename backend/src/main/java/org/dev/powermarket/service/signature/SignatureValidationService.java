package org.dev.powermarket.service.signature;

import lombok.RequiredArgsConstructor;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.dto.response.SignatureValidationResult;
import org.dev.powermarket.exception.SignatureValidationException;
import org.dev.powermarket.security.entity.User;
import org.dev.powermarket.security.repository.AuthorizedUserRepository;
import org.dev.powermarket.service.RentalAccessService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.dev.powermarket.service.signature.validation.*;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SignatureValidationService {

    // Список валидаторов, которые будут применены последовательно
    private final List<SignatureValidator> validators;
    private final RentalAccessService rentalAccessService;
    private final AuthorizedUserRepository userRepository;

    /**
     * Проверяет файл электронной подписи
     */
    public SignatureValidationResult validate(String email, UUID rentalId, MultipartFile file) {
        // Если файл пустой - сразу возвращаем ошибку
        if (file == null || file.isEmpty()) {
            return SignatureValidationResult.rejected("Файл не предоставлен или пуст");
        }

        // Проверяем доступ пользователя к аренде
        Rental rental = rentalAccessService.getRentalWithAccessCheck(rentalId, email);

        // Проходим по всем валидаторам
        for (SignatureValidator validator : validators) {
            SignatureValidationResult result = validator.validate(file);
            if (!result.validResult()) {
                return result;
            }
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        setSignatureValidForParty(user.getId(), rental);

        // Все проверки пройдены
        return SignatureValidationResult.accepted(
                file.getOriginalFilename(),
                file.getSize(),
                getFileExtension(file.getOriginalFilename())
        );
    }

    /**
     * Вспомогательный метод для получения расширения файла
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private void setSignatureValidForParty(UUID userId, Rental rental) {
        if (rental.getSupplier().getId().equals(userId)) {
            rental.setSupplierSignatureValid(true);
        } else if (rental.getTenant().getId().equals(userId)) {
            rental.setTenantSignatureValid(true);
        } else {
            throw new SignatureValidationException("Вы не можете подписать договор, к которому не имеете доступа (данная ошибка не может произойти)");
        }
    }
}