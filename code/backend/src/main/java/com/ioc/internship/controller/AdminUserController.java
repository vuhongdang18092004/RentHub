package com.ioc.internship.controller;

import com.ioc.internship.dto.request.UserStatusUpdateRequest;
import com.ioc.internship.dto.response.UserResponse;
import com.ioc.internship.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsersForAdmin(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(userService.getAllUsersForAdmin(keyword, role, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserDetailForAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserDetailForAdmin(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatusByAdmin(@PathVariable Long id,
                                                                @Valid @RequestBody UserStatusUpdateRequest request,
                                                                Authentication authentication) {
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(userService.updateUserStatusByAdmin(id, request, adminEmail));
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lockUser(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "User locked: " + id));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "User unlocked: " + id));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<?> getUserActivities(@PathVariable Long id) {
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(Map.of("message", "user analytics"));
    }
}
