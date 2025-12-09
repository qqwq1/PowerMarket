
package org.dev.powermarket.service;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.dev.powermarket.domain.Service;
import org.dev.powermarket.domain.enums.ServiceCategory;
import org.dev.powermarket.repository.ServiceExportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServiceExportServiceTest {

    @Mock
    private ServiceExportRepository serviceExportRepository;

    @InjectMocks
    private ServiceExportService serviceExportService;

    private UUID supplierId;
    private Service sampleService;

    @BeforeEach
    void setUp() {
        supplierId = UUID.randomUUID();
        sampleService = new Service();
        sampleService.setTitle("Sample title");
        sampleService.setDescription("Sample description");
        sampleService.setCategory(ServiceCategory.OTHER);
        sampleService.setPricePerDay(BigDecimal.valueOf(250));
        sampleService.setCreatedAt(Instant.now());
    }

    @Test
    void getLotsToExelByPeriod_WithNullDates_UsesDefaultRangeAndExportsWorkbook() throws Exception {
        when(serviceExportRepository.getLotsByCreatedAt(eq(supplierId), eq(Instant.parse("1970-01-01T00:00:00Z")), org.mockito.Mockito.any()))
                .thenReturn(List.of(sampleService));

        byte[] bytes = serviceExportService.getLotsToExelByPeriod(supplierId, null, null);

        assertThat(bytes).isNotEmpty();

        try (XSSFWorkbook workbook = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
            Row header = workbook.getSheet("Лоты").getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("Заголовок");

            Row row = workbook.getSheet("Лоты").getRow(1);
            assertThat(row.getCell(0).getStringCellValue()).isEqualTo("Sample title");
            assertThat(row.getCell(1).getStringCellValue()).isEqualTo("Sample description");
        }

        ArgumentCaptor<Instant> toCaptor = ArgumentCaptor.forClass(Instant.class);
        verify(serviceExportRepository).getLotsByCreatedAt(eq(supplierId), eq(Instant.parse("1970-01-01T00:00:00Z")), toCaptor.capture());
        assertThat(toCaptor.getValue()).isNotNull();
    }

    @Test
    void getLotsToExelByPeriod_WithProvidedPeriod_PassesInstantsToRepository() throws Exception {
        OffsetDateTime from = OffsetDateTime.now().minusDays(7);
        OffsetDateTime to = OffsetDateTime.now().minusDays(1);
        when(serviceExportRepository.getLotsByCreatedAt(supplierId, from.toInstant(), to.toInstant()))
                .thenReturn(List.of());

        byte[] bytes = serviceExportService.getLotsToExelByPeriod(supplierId, from, to);

        assertThat(bytes).isNotEmpty();
        verify(serviceExportRepository).getLotsByCreatedAt(supplierId, from.toInstant(), to.toInstant());
    }
}
