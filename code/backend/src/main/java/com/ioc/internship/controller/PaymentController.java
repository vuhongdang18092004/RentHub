package com.ioc.internship.controller;

import com.ioc.internship.dto.request.PaymentRecordRequest;
import com.ioc.internship.dto.response.PaymentResponse;
import com.ioc.internship.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(
            @RequestBody PaymentRecordRequest request) {
        return ResponseEntity.ok(paymentService.recordPayment(request));
    }

    @PostMapping("/refunds")
    public ResponseEntity<PaymentResponse> recordRefund(
            @RequestBody com.ioc.internship.dto.request.RefundRequest request,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(paymentService.recordRefund(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<Page<PaymentResponse>> getAllPayments(Pageable pageable) {
        return ResponseEntity.ok(paymentService.getAllPayments(pageable));
    }

    @GetMapping("/rentals/{rentalId}")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsByRental(
            @PathVariable Long rentalId,
            Pageable pageable) {
        return ResponseEntity.ok(paymentService.getPaymentsByRental(rentalId, pageable));
    }
}
