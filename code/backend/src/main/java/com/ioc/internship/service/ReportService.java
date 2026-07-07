package com.ioc.internship.service;

import com.ioc.internship.dto.request.ReportAdminResolveRequest;
import com.ioc.internship.dto.request.ReportCreateRequest;
import com.ioc.internship.dto.response.ReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReportService {
    ReportResponse createReport(String email, ReportCreateRequest request);
    Page<ReportResponse> getMyReports(String email, Pageable pageable);
    ReportResponse getReportDetail(String email, Long reportId);
    ReportResponse updateReportStatusAdmin(Long reportId, ReportAdminResolveRequest request);
}
