package com.ioc.internship.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewDto {
    private long totalUsers;
    private long totalOwners;
    private long totalRenters;
    private long totalProducts;
    private long totalRentals;
    private double totalRevenue;
    private long totalReports;
    private long totalReviews;
    private long activeRentals;
    private long pendingProducts;
    private long pendingReports;
    private long unreadNotifications;
}
