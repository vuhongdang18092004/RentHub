package com.ioc.internship.service;

import com.ioc.internship.dto.request.PaymentRecordRequest;
import com.ioc.internship.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse recordPayment(PaymentRecordRequest request);
    PaymentResponse recordRefund(String email, com.ioc.internship.dto.request.RefundRequest request);
    
    org.springframework.data.domain.Page<PaymentResponse> getAllPayments(org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<PaymentResponse> getPaymentsByRental(Long rentalId, org.springframework.data.domain.Pageable pageable);
}
