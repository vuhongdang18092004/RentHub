package com.ioc.internship.dto.response;

import com.ioc.internship.entity.ReportReason;
import com.ioc.internship.entity.ReportStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReportResponse {
    private Long id;
    private Long reporterId;
    private Long reportedUserId;
    private Long rentalId;
    private Long productId;
    private ReportReason reason;
    private String description;
    private ReportStatus status;
    private String adminNote;
    private String evidenceImageUrl;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
