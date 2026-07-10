package com.ioc.internship.controller;

import com.ioc.internship.dto.request.ReviewRequest;
import com.ioc.internship.dto.response.ReviewResponse;
import com.ioc.internship.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping("/reviews")
    @PreAuthorize("hasAnyAuthority('ROLE_USER', 'ROLE_ADMIN')")
    public ResponseEntity<ReviewResponse> createReview(Principal principal, @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(principal.getName(), request));
    }

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sort) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId, PageRequest.of(page, size), sort));
    }

    @GetMapping("/reviews/{id}")
    public ResponseEntity<ReviewResponse> getReviewDetail(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReviewDetail(id));
    }
}
