package com.ioc.internship.controller;

import com.ioc.internship.dto.request.RefundRequest;
import com.ioc.internship.dto.response.PaymentResponse;
import com.ioc.internship.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class RefundController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> recordRefund(
            @RequestBody RefundRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(paymentService.recordRefund(email, request));
    }
}
