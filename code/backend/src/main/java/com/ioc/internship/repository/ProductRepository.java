package com.ioc.internship.repository;

import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
    
    @EntityGraph(attributePaths = {"category", "owner", "images"})
    Optional<Product> findByIdAndStatus(Long id, ProductStatus status);

    Page<Product> findByOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);
    Page<Product> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, ProductStatus status, Pageable pageable);
    Page<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
    Page<Product> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Optional<Product> findByIdAndOwnerId(Long id, Long ownerId);
    Page<Product> findByStatusAndCategoryIdOrderByCreatedAtDesc(ProductStatus status, Long categoryId, Pageable pageable);
}
