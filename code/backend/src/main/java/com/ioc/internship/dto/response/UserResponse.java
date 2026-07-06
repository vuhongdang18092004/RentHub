package com.ioc.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String role;
    private String status;
    private String bankAccountNumber;
    private String bankCode;
    private String bankAccountHolderName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
