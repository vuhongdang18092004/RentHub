package com.ioc.internship.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationStatusResponse {
    private boolean registered;
    private boolean verified;
    private int canResendIn; // Thời gian đếm ngược còn lại tính bằng giây
}
