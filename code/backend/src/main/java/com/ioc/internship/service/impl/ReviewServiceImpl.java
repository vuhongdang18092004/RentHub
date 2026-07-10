package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.ReviewRequest;
import com.ioc.internship.dto.response.AdminReviewAnalyticsResponse;
import com.ioc.internship.dto.response.ReviewResponse;
import com.ioc.internship.dto.response.UserSummaryResponse;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.ProductRepository;
import com.ioc.internship.repository.RentalRepository;
import com.ioc.internship.repository.ReviewRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.ReviewService;
import com.ioc.internship.service.NotificationService;
import com.ioc.internship.service.AuditLogService;
import com.ioc.internship.dto.request.NotificationCreateCommand;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public ReviewResponse createReview(String email, ReviewRequest request) {
        UserEntity renter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("404 Not Found: User not found"));

        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        if (!rental.getRenter().getId().equals(renter.getId())) {
            throw new RuntimeException("400 Bad Request: You are not the renter of this rental");
        }

        if (rental.getStatus() != RentalStatus.COMPLETED) {
            throw new RuntimeException("400 Bad Request: Rental is not completed");
        }

        if (reviewRepository.existsByRentalId(rental.getId())) {
            throw new RuntimeException("400 Bad Request: Review already exists for this rental");
        }

        Product product = rental.getProduct();

        Review review = Review.builder()
                .rental(rental)
                .product(product)
                .reviewer(renter)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        product.addReviewRating(request.getRating());
        productRepository.save(product);

        try {
            notificationService.create(NotificationCreateCommand.builder()
                    .user(product.getOwner())
                    .title("Đánh giá mới")
                    .message("Khách thuê đã đánh giá " + request.getRating() + " sao cho sản phẩm " + product.getName())
                    .type(NotificationType.REVIEW_RECEIVED)
                    .actionUrl("/products/" + product.getId())
                    .build());
        } catch (Exception e) {
            log.error("Failed to send notification for new review", e);
        }

        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable, String sortStr) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("highest".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if ("lowest".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.ASC, "rating").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        } else if ("newest".equalsIgnoreCase(sortStr)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }
        
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        return reviewRepository.findByProductId(productId, sortedPageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewDetail(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Review not found"));
        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviewsAdmin(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteReviewAdmin(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Review not found"));
        
        Product product = review.getProduct();
        product.removeReviewRating(review.getRating());
        productRepository.save(product);
        
        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminReviewAnalyticsResponse getReviewAnalytics() {
        long totalReviews = reviewRepository.getTotalReviews();
        Double averageRatingDouble = reviewRepository.getAverageSystemRating();
        BigDecimal averageRating = averageRatingDouble == null ? BigDecimal.ZERO : 
                BigDecimal.valueOf(averageRatingDouble).setScale(1, java.math.RoundingMode.HALF_UP);
        
        long oneStar = 0, twoStar = 0, threeStar = 0, fourStar = 0, fiveStar = 0;
        
        List<Object[]> distribution = reviewRepository.getRatingDistribution();
        for (Object[] obj : distribution) {
            Integer rating = (Integer) obj[0];
            long count = ((Number) obj[1]).longValue();
            switch (rating) {
                case 1 -> oneStar = count;
                case 2 -> twoStar = count;
                case 3 -> threeStar = count;
                case 4 -> fourStar = count;
                case 5 -> fiveStar = count;
            }
        }
        
        return AdminReviewAnalyticsResponse.builder()
                .totalReviews(totalReviews)
                .averageRating(averageRating)
                .oneStar(oneStar)
                .twoStar(twoStar)
                .threeStar(threeStar)
                .fourStar(fourStar)
                .fiveStar(fiveStar)
                .build();
    }

    @Override
    @Transactional
    public void hideReview(Long id, String reason, Long adminId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Review not found"));
        review.setIsHidden(true);
        review.setHiddenReason(reason);
        review.setHiddenBy(adminId);
        review.setHiddenAt(java.time.LocalDateTime.now());
        reviewRepository.save(review);
        auditLogService.log(adminId, "HIDE_REVIEW", "Review", id, "Public", "Hidden: " + reason);
    }

    @Override
    @Transactional
    public void restoreReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Review not found"));
        Long oldAdminId = review.getHiddenBy();
        review.setIsHidden(false);
        review.setHiddenReason(null);
        review.setHiddenBy(null);
        review.setHiddenAt(null);
        reviewRepository.save(review);
        auditLogService.log(oldAdminId != null ? oldAdminId : 1L, "RESTORE_REVIEW", "Review", id, "Hidden", "Public");
    }

    private ReviewResponse mapToResponse(Review review) {
        UserEntity user = review.getReviewer();
        UserSummaryResponse reviewerSummary = UserSummaryResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
                
        return ReviewResponse.builder()
                .id(review.getId())
                .rentalId(review.getRental().getId())
                .productId(review.getProduct().getId())
                .reviewer(reviewerSummary)
                .rating(review.getRating())
                .comment(review.getComment())
                .isHidden(review.getIsHidden())
                .hiddenReason(review.getHiddenReason())
                .hiddenBy(review.getHiddenBy())
                .hiddenAt(review.getHiddenAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
