package com.ioc.internship.controller;

import com.ioc.internship.dto.response.RentalRequestDetailResponse;
import com.ioc.internship.dto.response.RentalRequestSummaryResponse;
import com.ioc.internship.entity.RequestStatus;
import com.ioc.internship.service.RentalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class OwnerRentalRequestController {

    private final RentalRequestService rentalRequestService;

    @GetMapping("/requests")
    public ResponseEntity<Page<RentalRequestSummaryResponse>> getOwnerRentalRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalRequestService.getOwnerRentalRequests(email, status, productId, keyword, sort, page, size));
    }

    @GetMapping("/requests/statistics")
    public ResponseEntity<com.ioc.internship.dto.response.RentalRequestStatisticsResponse> getOwnerRentalRequestStatistics(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalRequestService.getOwnerRentalRequestStatistics(email));
    }

    @GetMapping("/requests/{id}")
    public ResponseEntity<RentalRequestDetailResponse> getOwnerRentalRequestDetail(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalRequestService.getOwnerRentalRequestDetail(email, id));
    }

    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<Void> approveRentalRequest(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        rentalRequestService.approveRentalRequest(email, id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<Void> rejectRentalRequest(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        rentalRequestService.rejectRentalRequest(email, id);
        return ResponseEntity.ok().build();
    }
}
