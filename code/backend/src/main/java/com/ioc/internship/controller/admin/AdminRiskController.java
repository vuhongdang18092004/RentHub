package com.ioc.internship.controller.admin;

import com.ioc.internship.service.RiskAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/risk")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRiskController {

    private final RiskAnalyticsService riskAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getRiskAnalytics() {
        return ResponseEntity.ok(riskAnalyticsService.getRiskAnalytics());
    }
}
