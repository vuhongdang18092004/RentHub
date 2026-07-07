package com.ioc.internship.dto.request;

import com.ioc.internship.entity.ReportStatus;
import com.ioc.internship.entity.ResolutionAction;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ReportAdminResolveRequest {
    private ReportStatus status;
    private ResolutionAction resolutionAction;
    private String adminNote;
    private BigDecimal refundAmount;
}
