package com.ioc.internship.controller;

import com.ioc.internship.dto.request.LoginRequest;
import com.ioc.internship.dto.request.RegisterRequest;
import com.ioc.internship.dto.response.AuthResponse;
import com.ioc.internship.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth") // Khớp với đường dẫn được mở cửa tự do trong SecurityConfig
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService; // Inject Interface vào đây, Spring Boot sẽ tự động tìm đến bản Impl để chạy

    // 1. API ĐĂNG KÝ: POST http://localhost:8080/api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Bốc lấy đối tượng AuthResponse chứa tokenValue từ tầng Service sinh ra
        AuthResponse response = authService.register(request);

        // Trả thẳng đối tượng AuthResponse về cho Frontend để tự động nối đuôi URL kích hoạt
        return ResponseEntity.ok(response);
    }

    // 2. API XÁC THỰC EMAIL: GET http://localhost:8080/api/v1/auth/verify-email?token=...
    @GetMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        authService.verifyUserToken(token);
        return ResponseEntity.ok(Map.of("message", "Tài khoản kích hoạt thành công!"));
    }

    // 3. API ĐĂNG NHẬP: POST http://localhost:8080/api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        // Tiếp nhận gói dữ liệu LoginRequest, chuyển xuống tầng Service đối chiếu thông tin
        AuthResponse response = authService.login(request);
        // Trả về Token cùng thông tin User nếu đăng nhập thành công
        return ResponseEntity.ok(response);
    }
}