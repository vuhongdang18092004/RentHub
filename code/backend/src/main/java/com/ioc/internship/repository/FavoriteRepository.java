package com.ioc.internship.repository;

import com.ioc.internship.entity.Favorite;
import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserAndProduct(UserEntity user, Product product);
    Optional<Favorite> findByUserAndProduct_Id(UserEntity user, Long productId);
    Page<Favorite> findByUser(UserEntity user, Pageable pageable);
}
