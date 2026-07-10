package com.ioc.internship.repository;

import com.ioc.internship.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    boolean existsByRentalId(Long rentalId);
    
    Page<Review> findByProductId(Long productId, Pageable pageable);
    
    @Query("SELECT r.rating, COUNT(r) FROM Review r GROUP BY r.rating")
    List<Object[]> getRatingDistribution();
    
    @Query("SELECT COUNT(r) FROM Review r")
    long getTotalReviews();
    
    @Query("SELECT AVG(r.rating) FROM Review r")
    Double getAverageSystemRating();
}
