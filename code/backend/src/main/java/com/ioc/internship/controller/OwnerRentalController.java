package com.ioc.internship.controller;

import com.ioc.internship.service.RentalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner/rentals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class OwnerRentalController {

    private final RentalRequestService rentalRequestService;

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRentalAsOwner(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        rentalRequestService.cancelRentalAsOwner(email, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/confirm-return")
    public ResponseEntity<Void> confirmReturn(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        rentalRequestService.confirmReturn(email, id);
        return ResponseEntity.noContent().build();
    }
}
