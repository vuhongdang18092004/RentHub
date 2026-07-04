package com.ioc.internship.controller;

import com.ioc.internship.dto.request.UserUpdateRequest;
import com.ioc.internship.dto.response.UserResponse;
import com.ioc.internship.dto.response.PublicOwnerResponse;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.getMyProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateMyProfile(Authentication authentication,
                                                        @Valid @RequestBody UserUpdateRequest request) {
        String email = authentication.getName();
        return ResponseEntity.ok(userService.updateMyProfile(email, request));
    }

    @GetMapping("/{id}/public")
    public ResponseEntity<PublicOwnerResponse> getPublicProfile(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + id));
        return ResponseEntity.ok(PublicOwnerResponse.fromEntity(user));
    }
}
