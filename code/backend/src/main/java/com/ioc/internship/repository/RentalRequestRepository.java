package com.ioc.internship.repository;

import com.ioc.internship.entity.RentalRequest;
import com.ioc.internship.entity.RequestStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Map;

public interface RentalRequestRepository extends JpaRepository<RentalRequest, Long>, JpaSpecificationExecutor<RentalRequest> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM RentalRequest r WHERE r.id = :id")
    Optional<RentalRequest> findByIdForUpdate(@Param("id") Long id);

    Page<RentalRequest> findByRenterId(Long renterId, Pageable pageable);

    Page<RentalRequest> findByRenterIdAndStatus(Long renterId, RequestStatus status, Pageable pageable);

    Page<RentalRequest> findByOwnerId(Long ownerId, Pageable pageable);

    Page<RentalRequest> findByOwnerIdAndStatus(Long ownerId, RequestStatus status, Pageable pageable);

    List<RentalRequest> findByStatusAndExpiredAtBefore(RequestStatus status, LocalDateTime now);

    boolean existsByRenterIdAndProductIdAndStatus(Long renterId, Long productId, RequestStatus status);

    @Query("SELECT r.status, COUNT(r) FROM RentalRequest r WHERE r.owner.id = :ownerId GROUP BY r.status")
    List<Object[]> countRequestsByStatusForOwner(@Param("ownerId") Long ownerId);
}
