package com.ioc.internship.dto.request;

import com.ioc.internship.entity.PaymentMethod;
import com.ioc.internship.entity.PaymentStatus;
import com.ioc.internship.entity.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecordRequest {
    private Long rentalId;
    private PaymentType paymentType;
    private BigDecimal amount;
    private String transactionCode;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
}
