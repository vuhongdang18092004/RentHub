package com.ioc.internship.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_tokens")
@Data
@NoArgsConstructor
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Hàm khởi tạo nhanh khi sinh token mới
    public VerificationToken(String token, Long userId) {
        this.token = token;
        this.userId = userId;
        this.expiryDate = LocalDateTime.now().plusMinutes(15); // Hết hạn sau 15 phút
    }
}
