package com.ioc.internship.repository;

import com.ioc.internship.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;

public interface RentalRepository extends JpaRepository<Rental, Long> {

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END " +
           "FROM Rental r " +
           "WHERE r.product.id = :productId " +
           "AND r.status IN ('WAITING_PAYMENT', 'ACTIVE', 'RETURN_PENDING') " +
           "AND r.startDate <= :requestEnd " +
           "AND r.endDate >= :requestStart")
    boolean existsConflictingRental(@Param("productId") Long productId,
                                    @Param("requestStart") LocalDate requestStart,
                                    @Param("requestEnd") LocalDate requestEnd);

    @Query("SELECT r FROM Rental r " +
           "WHERE r.product.id = :productId " +
           "AND r.status IN ('WAITING_PAYMENT', 'ACTIVE', 'RETURN_PENDING') " +
           "ORDER BY r.startDate ASC")
    java.util.List<Rental> findBlockingRentalsByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Rental r WHERE r.request.id = :requestId")
    java.util.Optional<Rental> findByRequestId(@Param("requestId") Long requestId);
}
