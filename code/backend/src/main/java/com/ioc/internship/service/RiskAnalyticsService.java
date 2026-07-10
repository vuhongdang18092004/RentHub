package com.ioc.internship.service;

import com.ioc.internship.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RiskAnalyticsService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final PaymentRepository paymentRepository;
    private final RentalRepository rentalRepository;
    private final ProductRepository productRepository;

    public Map<String, Object> getRiskAnalytics() {
        Map<String, Object> riskData = new HashMap<>();

        // 1. Top Reported Users
        List<Object[]> reportedData = reportRepository.findTopReportedUsers(PageRequest.of(0, 5));
        List<Map<String, Object>> topReportedUsers = new ArrayList<>();
        long totalHighRisk = 0;
        for (Object[] row : reportedData) {
            Long id = (Long) row[0];
            String name = (String) row[1];
            String email = (String) row[2];
            Long count = (Long) row[3];
            
            String riskLevel = "LOW";
            if (count >= 5) {
                riskLevel = "CRITICAL";
                totalHighRisk++;
            } else if (count >= 3) {
                riskLevel = "HIGH";
                totalHighRisk++;
            } else if (count >= 2) {
                riskLevel = "MEDIUM";
            }

            Map<String, Object> u = new HashMap<>();
            u.put("id", id);
            u.put("name", name);
            u.put("email", email);
            u.put("reportsCount", count);
            u.put("riskLevel", riskLevel);
            topReportedUsers.add(u);
        }
        riskData.put("topReportedUsers", topReportedUsers);
        riskData.put("highRiskUsers", totalHighRisk);

        // 2. Top Cancelled Rentals (by Owner)
        List<Object[]> cancelledData = rentalRepository.findTopCancelledOwners(PageRequest.of(0, 5));
        List<Map<String, Object>> topCancelledRentals = new ArrayList<>();
        for (Object[] row : cancelledData) {
            Long ownerId = (Long) row[0];
            String ownerName = (String) row[1];
            Long cancellations = (Long) row[2];

            Map<String, Object> c = new HashMap<>();
            c.put("id", ownerId);
            c.put("owner", ownerName);
            c.put("cancellations", cancellations);
            c.put("rate", 100);
            topCancelledRentals.add(c);
        }
        riskData.put("topCancelledRentals", topCancelledRentals);

        // 3. Top Refunded Renters
        List<Object[]> refundedData = paymentRepository.findTopRefundedRenters(PageRequest.of(0, 5));
        List<Map<String, Object>> topRefundedUsers = new ArrayList<>();
        for (Object[] row : refundedData) {
            Long renterId = (Long) row[0];
            String renterName = (String) row[1];
            String email = (String) row[2];
            Long refunds = (Long) row[3];

            Map<String, Object> r = new HashMap<>();
            r.put("id", renterId);
            r.put("name", renterName);
            r.put("email", email);
            r.put("refundsCount", refunds);
            topRefundedUsers.add(r);
        }
        riskData.put("topRefundedUsers", topRefundedUsers);

        // 4. Overall counts
        riskData.put("pendingReports", reportRepository.countByStatus(com.ioc.internship.entity.ReportStatus.PENDING));
        riskData.put("suspiciousActivities", reportRepository.count());
        
        long totalPayments = paymentRepository.count();
        long totalRefunds = paymentRepository.findTopRefundedRenters(PageRequest.of(0, 1000)).size();
        double refundRate = totalPayments > 0 ? ((double) totalRefunds / totalPayments) * 100 : 0.0;
        riskData.put("refundRate", Math.round(refundRate * 10.0) / 10.0);

        return riskData;
    }
}
