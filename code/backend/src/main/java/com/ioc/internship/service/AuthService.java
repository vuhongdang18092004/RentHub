package com.ioc.internship.service;

import com.ioc.internship.dto.response.AuthResponse;
import com.ioc.internship.dto.request.LoginRequest;
import com.ioc.internship.dto.request.RegisterRequest;
import com.ioc.internship.dto.request.VerifyOtpRequest;
import com.ioc.internship.dto.request.ResendOtpRequest;
import com.ioc.internship.dto.request.ForgotPasswordRequest;
import com.ioc.internship.dto.request.ResetPasswordRequest;
import com.ioc.internship.dto.response.RegistrationStatusResponse;

public interface AuthService {

    void register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse verifyRegisterOtp(VerifyOtpRequest request);

    void resendRegisterOtp(ResendOtpRequest request);

    RegistrationStatusResponse getRegistrationStatus(String email);

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);
}