package com.ioc.internship.controller;

import com.ioc.internship.dto.request.CreateRentalRequest;
import com.ioc.internship.dto.request.UpdateRentalRequest;
import com.ioc.internship.dto.response.RentalRequestDetailResponse;
import com.ioc.internship.dto.response.RentalRequestSummaryResponse;
import com.ioc.internship.entity.RequestStatus;
import com.ioc.internship.service.RentalRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/renter/requests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class RenterRentalRequestController {

    private final RentalRequestService rentalRequestService;

    @PostMapping
    public ResponseEntity<RentalRequestDetailResponse> createRentalRequest(
            @Valid @RequestBody CreateRentalRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return new ResponseEntity<>(rentalRequestService.createRentalRequest(email, request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalRequestDetailResponse> updateRentalRequest(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRentalRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalRequestService.updateRentalRequest(email, id, request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRentalRequest(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        rentalRequestService.cancelRentalRequest(email, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<RentalRequestSummaryResponse>> getMyRentalRequests(
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalRequestService.getMyRentalRequests(email, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalRequestDetailResponse> getMyRentalRequestDetail(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(rentalRequestService.getMyRentalRequestDetail(email, id));
    }
}
