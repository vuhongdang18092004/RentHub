package com.ioc.internship.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        // Đường dẫn này trỏ thẳng về trang verify bên Next.js
        String verificationUrl = "http://localhost:3000/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[RentHub] Kích hoạt tài khoản của bạn");
        message.setText("Chào mừng bạn đã đăng ký thành viên trên RentHub!\n\n"
                + "Vui lòng click vào đường link dưới đây để xác thực tài khoản:\n"
                + verificationUrl + "\n\n"
                + "Lưu ý: Đường link này chỉ có hiệu lực trong vòng 15 phút.");

        mailSender.send(message);
    }
}