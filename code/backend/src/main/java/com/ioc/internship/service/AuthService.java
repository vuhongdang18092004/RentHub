package com.ioc.internship.service;

import com.ioc.internship.dto.response.AuthResponse;
import com.ioc.internship.dto.request.LoginRequest;
import com.ioc.internship.dto.request.RegisterRequest;

public interface AuthService {

    // Khai báo bộ khung cho tính năng Đăng ký
    AuthResponse register(RegisterRequest request);

    // Khai báo bộ khung cho tính năng Đăng nhập
    AuthResponse login(LoginRequest request);

    boolean verifyUserToken(String token);
}