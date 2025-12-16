package org.dev.powermarket.service.signature.validation;

import lombok.extern.slf4j.Slf4j;
import org.dev.powermarket.domain.dto.response.SignatureValidationResult;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
@Order(ValidatorOrder.CONTENT_TYPE)
public class ContentTypeValidator implements SignatureValidator {

    @Override
    public SignatureValidationResult validate(MultipartFile file) {
        String contentType = file.getContentType();

        // Базовая проверка типа содержимого
        if (contentType == null || contentType.isEmpty()) {
            log.info("Content-Type не указан для файла: {}", file.getOriginalFilename());
            // Не отклоняем, так как Content-Type может отсутствовать
            return SignatureValidationResult.valid();
        }

        // Проверяем, что это не исполняемый файл
        if (isPotentiallyDangerous(contentType)) {
            String message = String.format(
                    "Недопустимый тип содержимого: %s",
                    contentType
            );
            log.warn("Content-Type validation failed: {}", message);
            return SignatureValidationResult.rejected(message);
        }

        return SignatureValidationResult.valid();
    }

    private boolean isPotentiallyDangerous(String contentType) {
        return contentType.contains("application/x-msdownload") ||
                contentType.contains("application/x-sh") ||
                contentType.contains("application/x-exe") ||
                contentType.contains("application/x-bat") ||
                contentType.contains("application/x-cmd");
    }
}