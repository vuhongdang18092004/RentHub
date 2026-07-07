package com.ioc.internship.controller;

import com.ioc.internship.dto.request.ReportAdminResolveRequest;
import com.ioc.internship.dto.response.ReportResponse;
import com.ioc.internship.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final ReportService reportService;

    @PutMapping("/{id}/status")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ReportAdminResolveRequest request) {
        return ResponseEntity.ok(reportService.updateReportStatusAdmin(id, request));
    }
}
