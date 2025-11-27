package ru.leshchev.exportService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.leshchev.exportService.models.Lot;

import java.util.List;
import java.util.UUID;

@Repository
public interface LotRepository extends JpaRepository<Lot, UUID> {
    @Query("select s from Lot s where s.supplier.id = :id")
    List<Lot> getAllSupplierLots(@Param("id") UUID id);
}
