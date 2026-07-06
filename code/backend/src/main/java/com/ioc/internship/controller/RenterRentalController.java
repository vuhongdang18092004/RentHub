package com.ioc.internship.controller;

import com.ioc.internship.dto.response.RentalPaymentInfoResponse;
import com.ioc.internship.service.RentalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/renter/rentals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class RenterRentalController {

    private final RentalRequestService rentalRequestService;

    @GetMapping("/{id}/payment-info")
    public ResponseEntity<RentalPaymentInfoResponse> getPaymentInfo(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(
            rentalRequestService.getRentalPaymentInfo(authentication.getName(), id));
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<Void> confirmPayment(
            @PathVariable Long id, Authentication authentication) {
        rentalRequestService.confirmRentalPayment(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Void> requestReturn(
            @PathVariable Long id, Authentication authentication) {
        rentalRequestService.requestReturn(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
