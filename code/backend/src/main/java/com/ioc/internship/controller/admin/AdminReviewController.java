package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.response.AdminReviewAnalyticsResponse;
import com.ioc.internship.dto.response.ReviewResponse;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<ReviewResponse>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reviewService.getAllReviewsAdmin(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewDetail(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewDetail(id));
    }

    @PutMapping("/{id}/hide")
    public ResponseEntity<Void> hideReview(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload, Authentication authentication) {
        String reason = payload.get("reason");
        String email = authentication.getName();
        UserEntity admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        reviewService.hideReview(id, reason, admin.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreReview(@PathVariable Long id) {
        reviewService.restoreReview(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/analytics")
    public ResponseEntity<AdminReviewAnalyticsResponse> getReviewAnalytics() {
        return ResponseEntity.ok(reviewService.getReviewAnalytics());
    }
}
