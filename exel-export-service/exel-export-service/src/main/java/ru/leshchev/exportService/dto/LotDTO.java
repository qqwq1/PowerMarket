package ru.leshchev.exportService.dto;

import ru.leshchev.exportService.models.Lot;
import ru.leshchev.exportService.models.LotCategory;

import java.math.BigDecimal;
import java.util.UUID;

public class LotDTO {


    private String title;
    private String description;
    private LotCategory category;
    private BigDecimal price;



    public LotDTO(Lot lot) {
        this.title = lot.getTitle();
        this.description = lot.getDescription();
        this.category = lot.getCategory();
        this.price = lot.getPricePerDay();
    }


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category.toString();
    }

    public void setCategory(LotCategory category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

}
