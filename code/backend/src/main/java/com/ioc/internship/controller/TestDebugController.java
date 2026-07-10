package com.ioc.internship.controller;

import com.ioc.internship.dto.request.ReviewRequest;
import com.ioc.internship.dto.response.ReviewResponse;
import com.ioc.internship.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-debug")
@RequiredArgsConstructor
public class TestDebugController {

    private final ReviewService reviewService;

    @PostMapping("/reviews/{email}")
    public ResponseEntity<?> testCreateReview(@PathVariable String email, @RequestBody ReviewRequest request) {
        try {
            return ResponseEntity.ok(reviewService.createReview(email, request));
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            return ResponseEntity.status(500).body(sw.toString());
        }
    }
}
