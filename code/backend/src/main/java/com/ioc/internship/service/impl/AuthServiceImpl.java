package com.ioc.internship.service.impl;

import com.ioc.internship.common.utils.JwtUtils;
import com.ioc.internship.dto.response.AuthResponse;
import com.ioc.internship.dto.request.LoginRequest;
import com.ioc.internship.dto.request.RegisterRequest;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.entity.VerificationToken;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.repository.VerificationTokenRepository;
import com.ioc.internship.service.AuthService;
import com.ioc.internship.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    private final VerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 🌟 TỐI ƯU LOGIC CHẶN TRÙNG & DỌN RÁC
        var existingUserOpt = userRepository.findByEmail(request.getEmail());

        if (existingUserOpt.isPresent()) {
            UserEntity existingUser = existingUserOpt.get();
            if ("ACTIVE".equals(existingUser.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email này đã được sử dụng trên hệ thống!");
            } else if ("PENDING".equals(existingUser.getStatus())) {
                // Nếu tài khoản cũ đang PENDING, xóa sạch cả token lẫn user cũ để làm lại từ đầu
                tokenRepository.deleteByUserId(existingUser.getId());
                userRepository.delete(existingUser);
                userRepository.flush(); // Ép xuống DB ngay lập tức trước khi lưu bản ghi mới
            }
        }

        UserEntity user = new UserEntity();
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setStatus("PENDING");

        UserEntity savedUser = userRepository.save(user);

        // SINH MÃ TOKEN XÁC THỰC VÀ LƯU VÀO DATABASE
        String tokenValue = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken(tokenValue, savedUser.getId());
        tokenRepository.save(verificationToken);

        // BẮN MAIL QUA MAILDEV DOCKER
        emailService.sendVerificationEmail(savedUser.getEmail(), tokenValue);

        return AuthResponse.builder()
                .token(tokenValue)
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        UserEntity user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng!"));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tài khoản của bạn chưa được kích hoạt! Vui lòng kiểm tra hộp thư email.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String jwtToken = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .build();
    }

    @Override
    @Transactional
    public boolean verifyUserToken(String token) {
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã xác thực không hợp lệ hoặc đã bị chỉnh sửa!"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(verificationToken);
            throw new ResponseStatusException(HttpStatus.GONE, "Mã xác thực đã hết hạn! Vui lòng thực hiện đăng ký lại tài khoản.");
        }

        UserEntity user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng hợp lệ gắn liền với mã này!"));

        user.setStatus("ACTIVE");
        userRepository.save(user);

        tokenRepository.delete(verificationToken);

        return true;
    }
}