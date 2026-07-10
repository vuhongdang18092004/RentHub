package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.ReportAdminResolveRequest;
import com.ioc.internship.dto.request.ReportCreateRequest;
import com.ioc.internship.dto.response.ReportResponse;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.RentalRepository;
import com.ioc.internship.repository.ReportRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.repository.PaymentRepository;
import com.ioc.internship.repository.specification.ReportSpecification;
import com.ioc.internship.service.RentalService;
import com.ioc.internship.service.ReportService;
import com.ioc.internship.service.NotificationService;
import com.ioc.internship.dto.request.NotificationCreateCommand;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    
    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("404 Not Found: User not found"));
    }

    @Override
    @Transactional
    public ReportResponse createReport(String email, ReportCreateRequest request) {
        UserEntity reporter = getUserByEmail(email);
        Rental rental = rentalRepository.findById(request.getRentalId())
                .orElseThrow(() -> new RuntimeException("404 Not Found: Rental not found"));

        // Validation 1: Max 1 active Report per Rental
        long activeReports = reportRepository.countByRentalAndStatusIn(rental, List.of(ReportStatus.PENDING, ReportStatus.UNDER_REVIEW));
        if (activeReports > 0) {
            throw new RuntimeException("400 Bad Request: An active report already exists for this rental");
        }

        // Check relationship
        boolean isRenter = rental.getRenter().getId().equals(reporter.getId());
        boolean isOwner = rental.getOwner().getId().equals(reporter.getId());
        if (!isRenter && !isOwner) {
            throw new RuntimeException("403 Forbidden: Not your rental");
        }
        UserEntity reportedUser = isRenter ? rental.getOwner() : rental.getRenter();

        // Business Rule Validations
        ReportReason reason = request.getReason();
        RentalStatus status = rental.getStatus();

        if (reason == ReportReason.PRODUCT_NOT_AS_DESCRIBED) {
            if (status != RentalStatus.HANDOVER_PENDING) {
                throw new RuntimeException("400 Bad Request: PRODUCT_NOT_AS_DESCRIBED can only be reported if Rental is HANDOVER_PENDING");
            }
        } else if (reason == ReportReason.DAMAGED_PRODUCT) {
            if (status != RentalStatus.RETURN_PENDING) {
                throw new RuntimeException("400 Bad Request: DAMAGED_PRODUCT can only be reported if Rental is RETURN_PENDING");
            }
        } else if (reason == ReportReason.LATE_RETURN) {
            if (status != RentalStatus.RETURN_PENDING) {
                throw new RuntimeException("400 Bad Request: LATE_RETURN can only be reported if Rental is RETURN_PENDING");
            }
        } else if (reason == ReportReason.PAYMENT_DISPUTE || reason == ReportReason.NO_SHOW) {
            if (status != RentalStatus.WAITING_PAYMENT && status != RentalStatus.HANDOVER_PENDING) {
                throw new RuntimeException("400 Bad Request: PAYMENT_DISPUTE/NO_SHOW requires Rental to be WAITING_PAYMENT or HANDOVER_PENDING");
            }
        }

        Report report = Report.builder()
                .reporter(reporter)
                .reportedUser(reportedUser)
                .rental(rental)
                .product(rental.getProduct())
                .reason(reason)
                .description(request.getDescription())
                .evidenceImageUrl(request.getEvidenceImageUrl())
                .status(ReportStatus.PENDING)
                .build();

        Report savedReport = reportRepository.save(report);

        try {
            notificationService.create(NotificationCreateCommand.builder()
                    .user(reporter)
                    .title("Đã gửi báo cáo")
                    .message("Báo cáo của bạn đã được gửi tới Quản trị viên và đang chờ xử lý.")
                    .type(NotificationType.REPORT_SUBMITTED_TO_ADMIN)
                    .actionUrl("/reports/" + savedReport.getId())
                    .build());
        } catch (Exception e) {
            log.error("Failed to send notification for report submission", e);
        }

        return mapToResponse(savedReport);
    }

    @Override
    public Page<ReportResponse> getMyReports(String email, Pageable pageable) {
        UserEntity user = getUserByEmail(email);
        return reportRepository.findByReporterIdOrReportedUserId(user.getId(), user.getId(), pageable).map(this::mapToResponse);
    }

    @Override
    public ReportResponse getReportDetail(String email, Long reportId) {
        UserEntity user = getUserByEmail(email);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Report not found"));
        
        if (!report.getReporter().getId().equals(user.getId()) && !report.getReportedUser().getId().equals(user.getId())) {
            throw new RuntimeException("403 Forbidden: Not your report");
        }
        
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public ReportResponse updateReportStatusAdmin(Long reportId, ReportAdminResolveRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Report not found"));

        if (report.getStatus() == ReportStatus.RESOLVED || report.getStatus() == ReportStatus.REJECTED) {
            throw new RuntimeException("400 Bad Request: Report is already processed");
        }

        report.setStatus(request.getStatus());
        
        String actionNote = request.getResolutionAction() != null && request.getResolutionAction() != ResolutionAction.NO_ACTION
                ? "[RESOLVED_ACTION=" + request.getResolutionAction() + ", REFUND_AMOUNT=" + request.getRefundAmount() + "] " 
                : "";
        
        report.setAdminNote(actionNote + (request.getAdminNote() != null ? request.getAdminNote() : ""));

        if (request.getStatus() == ReportStatus.RESOLVED) {
            report.setResolvedAt(LocalDateTime.now());
            
            if (request.getResolutionAction() == ResolutionAction.REFUND_FULL || request.getResolutionAction() == ResolutionAction.REFUND_PARTIAL) {
                report.getRental().setStatus(com.ioc.internship.entity.RentalStatus.REFUND_PENDING);
                rentalRepository.save(report.getRental());
            } else if (request.getResolutionAction() == ResolutionAction.COMPLETE_RENTAL) {
                report.getRental().setStatus(com.ioc.internship.entity.RentalStatus.COMPLETED);
                rentalRepository.save(report.getRental());
            } else if (request.getResolutionAction() == ResolutionAction.CANCEL_RENTAL) {
                report.getRental().setStatus(com.ioc.internship.entity.RentalStatus.CANCELLED);
                rentalRepository.save(report.getRental());
            }
        }

        Report savedReport = reportRepository.save(report);

        if (request.getStatus() == ReportStatus.RESOLVED) {
            try {
                notificationService.create(NotificationCreateCommand.builder()
                        .user(savedReport.getReporter())
                        .title("Báo cáo đã được giải quyết")
                        .message("Quản trị viên đã xử lý báo cáo của bạn.")
                        .type(NotificationType.REPORT_RESOLVED_FOR_REPORTER)
                        .actionUrl("/reports/" + savedReport.getId())
                        .build());
            } catch (Exception e) {
                log.error("Failed to send notification for report resolution", e);
            }
        }

        return mapToResponse(savedReport);
    }

    @Override
    public Page<ReportResponse> getAllReportsAdmin(String status, Long rentalId, Long productId, Long reporterId, Long reportedUserId, Pageable pageable) {
        Specification<Report> spec = Specification.allOf();
        if (status != null && !status.isEmpty()) {
            spec = spec.and(ReportSpecification.hasStatus(ReportStatus.valueOf(status)));
        }
        spec = spec.and(ReportSpecification.hasRentalId(rentalId));
        spec = spec.and(ReportSpecification.hasProductId(productId));
        spec = spec.and(ReportSpecification.hasReporterId(reporterId));
        spec = spec.and(ReportSpecification.hasReportedUserId(reportedUserId));

        return reportRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Override
    public com.ioc.internship.dto.response.ReportDetailAdminResponse getReportDetailAdmin(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Report not found"));
        
        List<Payment> payments = paymentRepository.findByRentalOrderByIdDesc(report.getRental());
        List<com.ioc.internship.dto.response.PaymentResponse> paymentHistory = payments.stream().map(p -> 
            com.ioc.internship.dto.response.PaymentResponse.builder()
                .id(p.getId())
                .rentalId(p.getRental().getId())
                .payerId(p.getPayer().getId())
                .paymentMethod(p.getPaymentMethod())
                .paymentType(p.getPaymentType())
                .amount(p.getAmount())
                .transactionCode(p.getTransactionCode())
                .status(p.getStatus())
                .paidAt(p.getCreatedAt())
                .build()
        ).toList();

        return com.ioc.internship.dto.response.ReportDetailAdminResponse.builder()
                .id(report.getId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .evidenceImageUrl(report.getEvidenceImageUrl())
                .adminNote(report.getAdminNote())
                .resolvedAt(report.getResolvedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .reporter(com.ioc.internship.dto.response.UserSummaryResponse.fromEntity(report.getReporter()))
                .reportedUser(com.ioc.internship.dto.response.UserSummaryResponse.fromEntity(report.getReportedUser()))
                .product(com.ioc.internship.dto.response.ProductSummaryResponse.fromEntity(report.getProduct()))
                .rental(com.ioc.internship.dto.response.RentalDetailResponse.builder()
                        .id(report.getRental().getId())
                        .status(report.getRental().getStatus())
                        .startDate(report.getRental().getStartDate())
                        .endDate(report.getRental().getEndDate())
                        .rentalDays(report.getRental().getRentalDays())
                        .pricePerDay(report.getRental().getPricePerDay())
                        .totalPrice(report.getRental().getTotalPrice())
                        .build())
                .paymentHistory(paymentHistory)
                .build();
    }

    @Override
    public com.ioc.internship.dto.response.ReportAnalyticsResponse getAnalyticsAdmin() {
        Map<ReportStatus, Long> byStatus = new HashMap<>();
        for (Object[] row : reportRepository.countReportsByStatus()) {
            byStatus.put((ReportStatus) row[0], (Long) row[1]);
        }
        
        Map<ReportReason, Long> byReason = new HashMap<>();
        for (Object[] row : reportRepository.countReportsByReason()) {
            byReason.put((ReportReason) row[0], (Long) row[1]);
        }

        return com.ioc.internship.dto.response.ReportAnalyticsResponse.builder()
                .byStatus(byStatus)
                .byReason(byReason)
                .build();
    }

    private ReportResponse mapToResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .reporterId(report.getReporter().getId())
                .reportedUserId(report.getReportedUser().getId())
                .rentalId(report.getRental().getId())
                .productId(report.getProduct().getId())
                .reason(report.getReason())
                .description(report.getDescription())
                .status(report.getStatus())
                .adminNote(report.getAdminNote())
                .evidenceImageUrl(report.getEvidenceImageUrl())
                .resolvedAt(report.getResolvedAt())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
