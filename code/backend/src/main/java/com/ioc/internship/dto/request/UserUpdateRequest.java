package com.ioc.internship.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UserUpdateRequest {
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^0\\d{9}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private String avatarUrl;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    private String bankAccountNumber;
    private String bankCode;
    private String bankAccountHolderName;
}
