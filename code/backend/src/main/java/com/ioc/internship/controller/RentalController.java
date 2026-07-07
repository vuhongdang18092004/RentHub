package com.ioc.internship.controller;

import com.ioc.internship.dto.response.RentalLifecycleResponse;
import com.ioc.internship.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class RentalController {

    private final RentalService rentalService;

    @GetMapping("/{id}")
    public ResponseEntity<com.ioc.internship.dto.response.RentalDetailResponse> getRentalDetail(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalService.getRentalDetail(email, id));
    }

    @PutMapping("/{id}/handover")
    public ResponseEntity<RentalLifecycleResponse> handover(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalService.handoverRental(email, id));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<RentalLifecycleResponse> receive(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalService.receiveRental(email, id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<RentalLifecycleResponse> reject(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalService.rejectRental(email, id));
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<RentalLifecycleResponse> returnRental(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalService.returnRental(email, id));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<RentalLifecycleResponse> complete(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalService.completeRental(email, id));
    }
}
