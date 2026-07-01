package com.ioc.internship.repository;

import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByOwnerIdOrderByCreatedAtDesc(Long ownerId, Pageable pageable);
    Optional<Product> findByIdAndOwnerId(Long id, Long ownerId);
    Page<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status, Pageable pageable);
    Page<Product> findByStatusAndCategoryIdOrderByCreatedAtDesc(ProductStatus status, Long categoryId, Pageable pageable);
}
