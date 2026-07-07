package com.ioc.internship.dto.request;

import com.ioc.internship.entity.PaymentType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundRequest {
    private Long rentalId;
    private PaymentType paymentType;
    private BigDecimal amount;
    private String transactionCode;
}
