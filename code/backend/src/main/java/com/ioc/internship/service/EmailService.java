package com.ioc.internship.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (mailFrom != null && !mailFrom.isEmpty()) {
                message.setFrom(mailFrom);
            }
            message.setTo(toEmail);
            message.setSubject("[RentHub] Mã xác thực OTP của bạn");
            message.setText("Chào mừng bạn đến với RentHub!\n\n"
                    + "Mã xác thực OTP của bạn là: " + otpCode + "\n\n"
                    + "Lưu ý: Mã này chỉ có hiệu lực trong vòng 5 phút và tuyệt đối không chia sẻ cho người khác.");

            mailSender.send(message);
            log.info("Đã gửi email OTP thành công tới: {}", toEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email OTP tới: {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
        }
    }
}