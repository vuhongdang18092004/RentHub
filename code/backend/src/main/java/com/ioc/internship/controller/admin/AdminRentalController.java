package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.response.RentalDetailResponse;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.AdminRentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/rentals")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRentalController {

    private final AdminRentalService adminRentalService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<RentalDetailResponse>> getAllRentals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(adminRentalService.getAllRentals(pageable));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(Map.of("message", "analytics mock"));
    }
    
    @PutMapping("/{id}/cancel")
    public ResponseEntity<RentalDetailResponse> cancelRental(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        UserEntity admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(adminRentalService.cancelRental(admin.getId(), id));
    }
}
