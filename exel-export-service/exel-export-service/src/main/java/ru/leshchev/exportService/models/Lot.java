package ru.leshchev.exportService.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "services")
public class Lot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private User supplier;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private LotCategory category;

    @Column(name = "pricePerDay", precision = 10, scale = 2)
    private BigDecimal pricePerDay;

    @Column(name = "capacity")
    private String capacity;

    @Column(name = "available_capacity")
    private String availableCapacity;

    @Column(name = "total_capacity_units")
    private Integer totalCapacityUnits;

    @Column(name = "location")
    private String location;

    @Column(name = "technical_specs", columnDefinition = "TEXT")
    private String technicalSpecs;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    @Column(name = "total_reviews")
    private Integer totalReviews;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public User getSupplier() {
        return supplier;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LotCategory getCategory() {
        return category;
    }

    public BigDecimal getPricePerDay() {
        return pricePerDay;
    }

    public String getCapacity() {
        return capacity;
    }

    public String getAvailableCapacity() {
        return availableCapacity;
    }

    public String getLocation() {
        return location;
    }

    public Integer getTotalCapacityUnits() {
        return totalCapacityUnits;
    }

    public String getTechnicalSpecs() {
        return technicalSpecs;
    }

    public Boolean getActive() {
        return isActive;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}

