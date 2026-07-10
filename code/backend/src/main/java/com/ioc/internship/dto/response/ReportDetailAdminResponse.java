package com.ioc.internship.dto.response;

import com.ioc.internship.entity.ReportReason;
import com.ioc.internship.entity.ReportStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReportDetailAdminResponse {
    private Long id;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private String evidenceImageUrl;
    private String adminNote;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private UserSummaryResponse reporter;
    private UserSummaryResponse reportedUser;
    private ProductSummaryResponse product;
    private RentalDetailResponse rental;
    
    private List<PaymentResponse> paymentHistory;
}
