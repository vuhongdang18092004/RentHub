package com.ioc.internship.controller.admin;

import com.ioc.internship.dto.admin.DashboardOverviewDto;
import com.ioc.internship.dto.admin.RecentActivityDto;
import com.ioc.internship.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/overview")
    public ResponseEntity<DashboardOverviewDto> getOverview() {
        return ResponseEntity.ok(adminDashboardService.getOverview());
    }

    @GetMapping("/recent-activities")
    public ResponseEntity<List<RecentActivityDto>> getRecentActivities() {
        return ResponseEntity.ok(adminDashboardService.getRecentActivities());
    }
    
    // Additional endpoints for growth, revenue, etc. will be added later
}
