package org.dev.powermarket.service.signature.validation;

import org.dev.powermarket.domain.dto.response.SignatureValidationResult;
import org.springframework.web.multipart.MultipartFile;

public interface SignatureValidator {

    /**
     * Проверяет файл и возвращает результат валидации
     */
    SignatureValidationResult validate(MultipartFile file);

    /**
     * Порядок выполнения валидатора (меньше = раньше)
     */
    default int getOrder() {
        return 0;
    }
}