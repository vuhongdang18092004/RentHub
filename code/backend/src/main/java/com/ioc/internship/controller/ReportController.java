package com.ioc.internship.controller;

import com.ioc.internship.dto.request.ReportCreateRequest;
import com.ioc.internship.dto.response.ReportResponse;
import com.ioc.internship.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @RequestBody ReportCreateRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reportService.createReport(email, request));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ReportResponse>> getMyReports(
            Pageable pageable,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reportService.getMyReports(email, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReportDetail(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(reportService.getReportDetail(email, id));
    }
}
