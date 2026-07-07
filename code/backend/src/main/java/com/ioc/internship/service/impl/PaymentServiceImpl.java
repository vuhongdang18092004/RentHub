package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.PaymentRecordRequest;
import com.ioc.internship.dto.request.RefundRequest;
import com.ioc.internship.dto.response.PaymentResponse;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.PaymentRepository;
import com.ioc.internship.repository.RentalRepository;
import com.ioc.internship.repository.ReportRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.ioc.internship.service.RentalService;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final RentalService rentalService;

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRecordRequest request) {
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        if (request.getTransactionCode() != null && !request.getTransactionCode().trim().isEmpty()) {
            if (paymentRepository.existsByTransactionCode(request.getTransactionCode())) {
                throw new RuntimeException("400 Bad Request: Transaction code already exists");
            }
        }

        if (request.getStatus() == PaymentStatus.SUCCESS) {
            if (request.getPaymentType() == PaymentType.DEPOSIT) {
                long depositCount = paymentRepository.countByRentalAndPaymentTypeAndStatus(rental, PaymentType.DEPOSIT, PaymentStatus.SUCCESS);
                if (depositCount > 0) {
                    throw new RuntimeException("400 Bad Request: Rental already has a successful DEPOSIT payment");
                }
            } else if (request.getPaymentType() == PaymentType.RENTAL_FEE) {
                long feeCount = paymentRepository.countByRentalAndPaymentTypeAndStatus(rental, PaymentType.RENTAL_FEE, PaymentStatus.SUCCESS);
                if (feeCount > 0) {
                    throw new RuntimeException("400 Bad Request: Rental already has a successful RENTAL_FEE payment");
                }
            }
        }

        UserEntity payer = (request.getPaymentType() == PaymentType.DEPOSIT || request.getPaymentType() == PaymentType.RENTAL_FEE) 
                ? rental.getRenter() : rental.getOwner();

        Payment payment = Payment.builder()
                .rental(rental)
                .payer(payer)
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod())
                .amount(request.getAmount())
                .transactionCode(request.getTransactionCode())
                .status(request.getStatus())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return mapToResponse(savedPayment);
    }

    @Override
    @Transactional
    public PaymentResponse recordRefund(String email, RefundRequest request) {
        UserEntity owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("404 Not Found: User not found"));

        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        // Validation 2: Caller is exactly the Rental owner
        if (!rental.getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("403 Forbidden: You are not the owner of this rental");
        }

        // Validation 3: Rental is not already cancelled
        if (rental.getStatus() == RentalStatus.CANCELLED) {
            throw new RuntimeException("400 Bad Request: Rental is already CANCELLED");
        }

        // Validation 4 & 5: There is a RESOLVED Report with REFUND_FULL or REFUND_PARTIAL
        // Assuming we find the latest resolved report or simply check if one exists
        // Wait, ReportRepository needs findFirstByRentalAndStatusOrderByResolvedAtDesc
        // Let's iterate all reports for rental
        List<Report> resolvedReports = reportRepository.findByRentalAndStatusOrderByIdDesc(rental, ReportStatus.RESOLVED);
        if (resolvedReports.isEmpty()) {
            throw new RuntimeException("400 Bad Request: No RESOLVED report found for this rental");
        }
        
        Report report = resolvedReports.get(0);
        String note = report.getAdminNote() != null ? report.getAdminNote() : "";
        if (!note.contains("RESOLVED_ACTION=REFUND_FULL") && !note.contains("RESOLVED_ACTION=REFUND_PARTIAL")) {
            throw new RuntimeException("400 Bad Request: Admin resolution action is not a REFUND");
        }
        
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("REFUND_AMOUNT=([0-9.]+)").matcher(note);
        if (!m.find()) {
            throw new RuntimeException("400 Bad Request: Refund amount not specified in admin decision");
        }
        BigDecimal adminAmount = new BigDecimal(m.group(1));
        
        if (adminAmount.compareTo(request.getAmount()) != 0) {
            throw new RuntimeException("400 Bad Request: Refund amount must match the Admin decision of " + adminAmount);
        }

        if (request.getTransactionCode() == null || request.getTransactionCode().trim().isEmpty()) {
            throw new RuntimeException("400 Bad Request: Transaction code is required");
        }
        if (paymentRepository.existsByTransactionCode(request.getTransactionCode())) {
            throw new RuntimeException("400 Bad Request: Transaction code already exists");
        }

        boolean hasRefund = paymentRepository.existsByRentalAndPaymentTypeInAndStatus(
                rental, 
                List.of(PaymentType.REFUND_CANCEL, PaymentType.REFUND_DEPOSIT), 
                PaymentStatus.SUCCESS
        );
        if (hasRefund) {
            throw new RuntimeException("400 Bad Request: Rental already has a SUCCESS refund");
        }

        Payment payment = Payment.builder()
                .rental(rental)
                .payer(owner)
                .paymentType(request.getPaymentType())
                .paymentMethod(PaymentMethod.PAYOS)
                .amount(request.getAmount())
                .transactionCode(request.getTransactionCode())
                .status(PaymentStatus.SUCCESS)
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        
        if (request.getPaymentType() == PaymentType.REFUND_CANCEL) {
            rentalService.adminCancelRental(rental.getId());
        } else if (request.getPaymentType() == PaymentType.REFUND_DEPOSIT) {
            rentalService.adminCompleteRental(rental.getId());
        }

        return mapToResponse(savedPayment);
    }

    @Override
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public Page<PaymentResponse> getPaymentsByRental(Long rentalId, Pageable pageable) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));
        return paymentRepository.findByRental(rental, pageable).map(this::mapToResponse);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .rentalId(payment.getRental().getId())
                .payerId(payment.getPayer().getId())
                .paymentMethod(payment.getPaymentMethod())
                .paymentType(payment.getPaymentType())
                .amount(payment.getAmount())
                .transactionCode(payment.getTransactionCode())
                .status(payment.getStatus())
                .paidAt(payment.getCreatedAt())
                .build();
    }
}
