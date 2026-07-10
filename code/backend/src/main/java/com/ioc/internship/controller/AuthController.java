package com.ioc.internship.controller;

import com.ioc.internship.dto.request.LoginRequest;
import com.ioc.internship.dto.request.RegisterRequest;
import com.ioc.internship.dto.request.VerifyOtpRequest;
import com.ioc.internship.dto.request.ResendOtpRequest;
import com.ioc.internship.dto.request.ForgotPasswordRequest;
import com.ioc.internship.dto.request.ResetPasswordRequest;
import com.ioc.internship.dto.response.AuthResponse;
import com.ioc.internship.dto.response.RegistrationStatusResponse;
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
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(Map.of("message", "Chúng tôi đã gửi mã xác thực tới email của bạn."));
    }

    @PostMapping("/verify-register-otp")
    public ResponseEntity<AuthResponse> verifyRegisterOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyRegisterOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-register-otp")
    public ResponseEntity<Map<String, String>> resendRegisterOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendRegisterOtp(request);
        return ResponseEntity.ok(Map.of("message", "Đã gửi lại mã xác thực tới email của bạn."));
    }

    @GetMapping("/registration-status")
    public ResponseEntity<RegistrationStatusResponse> getRegistrationStatus(@RequestParam("email") String email) {
        return ResponseEntity.ok(authService.getRegistrationStatus(email));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "Chúng tôi đã gửi mã xác thực tới email của bạn."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."));
    }
}