package com.ioc.internship.dto.response;

import com.ioc.internship.entity.PaymentMethod;
import com.ioc.internship.entity.PaymentStatus;
import com.ioc.internship.entity.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long rentalId;
    private Long payerId;
    private PaymentMethod paymentMethod;
    private PaymentType paymentType;
    private BigDecimal amount;
    private String transactionCode;
    private PaymentStatus status;
    private LocalDateTime paidAt; // Map to createdAt
}
