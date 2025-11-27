package ru.leshchev.exportService.service;


import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.leshchev.exportService.dto.LotDTO;
import ru.leshchev.exportService.models.Lot;
import ru.leshchev.exportService.repository.LotRepository;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class LotService {

    private final LotRepository servicesRepository;



    @Autowired
    public LotService(LotRepository servicesRepository) {
        this.servicesRepository = servicesRepository;
    }

    public List<LotDTO> getAll() {
        List<Lot> response = servicesRepository.findAll();
        List<LotDTO> result = new java.util.ArrayList<>();
        for (Lot lot : response) {
            result.add(new LotDTO(lot));
        }
        return result;
    }

    public List<LotDTO> getAllSupplierLots(UUID suppliersID){

        List<Lot> response = servicesRepository.getAllSupplierLots(suppliersID);
        List<LotDTO> result = new java.util.ArrayList<>();
        for (Lot lot : response) {
            result.add(new LotDTO(lot));
        }
        return result;
    }

    public byte[] exportDataToExcel(UUID suppliersID) throws IOException {
        List<LotDTO> response = getAllSupplierLots(suppliersID);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Лоты");

            // заголовок
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Заголовок");
            header.createCell(1).setCellValue("Описание");
            header.createCell(2).setCellValue("Категория");
            header.createCell(3).setCellValue("Цена");

            int rowIdx = 1;
            for (LotDTO lot : response) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(lot.getTitle());
                row.createCell(1).setCellValue(lot.getDescription());
                row.createCell(2).setCellValue(lot.getCategory());
                if (lot.getPrice()!=null){
                    row.createCell(3).setCellValue(lot.getPrice().toString());
                }
                else {
                    row.createCell(3).setCellValue(0);
                }

            }

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
