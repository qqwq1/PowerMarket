package org.dev.powermarket.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.dev.powermarket.domain.Rental;
import org.dev.powermarket.domain.dto.response.ContractStatusDto;
import org.dev.powermarket.domain.enums.ContractStatus;
import org.dev.powermarket.exception.PdfFileNotFoundException;
import org.dev.powermarket.exception.PdfFileReadException;
import org.dev.powermarket.exception.RentalNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;

import java.nio.file.*;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContractService {

    @Value("${pdf.storage.path:./pdf-files}")
    private String storagePath;
    private final RentalAccessService rentalAccessService;

    public Resource getPdfFile(String filename) {
        try {
            Path filePath = Paths.get(storagePath).resolve(filename).normalize();

            if (!Files.exists(filePath)) {
                throw new PdfFileNotFoundException("PDF файл не найден: " + filename);
            }

            if (!filename.toLowerCase().endsWith(".pdf")) {
                throw new PdfFileNotFoundException("Файл должен быть PDF: " + filename);
            }

            // Возвращаем ресурс
            return new UrlResource(filePath.toUri());

        } catch (Exception e) {
            if (e instanceof PdfFileNotFoundException) {
                throw (PdfFileNotFoundException) e;
            }
            throw new PdfFileReadException("Ошибка при чтении файла: " + filename, e);
        }
    }

    public ContractStatusDto getContractStatus(String email, UUID rentalId) {
        Rental rental = rentalAccessService.getRentalWithAccessCheck(rentalId, email);
        return toDto(rental);
    }

    private ContractStatusDto toDto(Rental rental) {
        return new ContractStatusDto(
                new ContractStatusDto.SupplierStatusDto(rental.getSupplierConfirmed(),rental.getSupplierConfirmed()),
                new ContractStatusDto.TenantStatusDto(rental.getTenantConfirmed(),rental.getTenantConfirmed()),
                rental.getSupplierConfirmed()&&rental.getTenantConfirmed()  ? ContractStatus.SIGNED: ContractStatus.SIGNING
        );
    }

}