package com.ioc.internship.controller;

import com.ioc.internship.dto.request.ReportAdminResolveRequest;
import com.ioc.internship.dto.response.ReportResponse;
import com.ioc.internship.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ioc.internship.dto.response.ReportAnalyticsResponse;
import com.ioc.internship.dto.response.ReportDetailAdminResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getAllReports(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long reporterId,
            @RequestParam(required = false) Long reportedUserId,
            Pageable pageable) {
        return ResponseEntity.ok(reportService.getAllReportsAdmin(status, rentalId, productId, reporterId, reportedUserId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportDetailAdminResponse> getReportDetail(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReportDetailAdmin(id));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ReportAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(reportService.getAnalyticsAdmin());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ReportAdminResolveRequest request) {
        return ResponseEntity.ok(reportService.updateReportStatusAdmin(id, request));
    }
}
