package com.ioc.internship.service;

import com.ioc.internship.dto.request.ReviewRequest;
import com.ioc.internship.dto.response.AdminReviewAnalyticsResponse;
import com.ioc.internship.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(String email, ReviewRequest request);
    
    Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable, String sort);
    
    ReviewResponse getReviewDetail(Long id);
    
    Page<ReviewResponse> getAllReviewsAdmin(Pageable pageable);
    
    void deleteReviewAdmin(Long id);
    
    AdminReviewAnalyticsResponse getReviewAnalytics();
    
    void hideReview(Long id, String reason, Long adminId);
    
    void restoreReview(Long id);
}
