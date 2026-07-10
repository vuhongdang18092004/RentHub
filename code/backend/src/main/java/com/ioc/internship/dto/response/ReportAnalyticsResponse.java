package com.ioc.internship.dto.response;

import com.ioc.internship.entity.ReportReason;
import com.ioc.internship.entity.ReportStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ReportAnalyticsResponse {
    private Map<ReportStatus, Long> byStatus;
    private Map<ReportReason, Long> byReason;
}
