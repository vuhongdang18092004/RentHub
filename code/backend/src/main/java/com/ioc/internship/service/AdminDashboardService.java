package com.ioc.internship.service;

import com.ioc.internship.dto.admin.DashboardOverviewDto;
import com.ioc.internship.dto.admin.RecentActivityDto;
import com.ioc.internship.entity.AuditLog;
import com.ioc.internship.entity.ProductStatus;
import com.ioc.internship.entity.RentalStatus;
import com.ioc.internship.entity.ReportStatus;
import com.ioc.internship.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final RentalRepository rentalRepository;
    private final PaymentRepository paymentRepository;
    private final ReportRepository reportRepository;
    private final ReviewRepository reviewRepository;
    private final AdminNotificationRepository adminNotificationRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardOverviewDto getOverview() {
        return DashboardOverviewDto.builder()
                .totalUsers(userRepository.count())
                .totalOwners(userRepository.countByRole("ROLE_OWNER"))
                .totalRenters(userRepository.countByRole("ROLE_USER"))
                .totalProducts(productRepository.count())
                .totalRentals(rentalRepository.count())
                .totalRevenue(paymentRepository.calculateTotalRevenue().doubleValue())
                .totalReports(reportRepository.count())
                .totalReviews(reviewRepository.count())
                .activeRentals(rentalRepository.countByStatus(RentalStatus.ACTIVE))
                .pendingProducts(productRepository.countByStatus(ProductStatus.PENDING))
                .pendingReports(reportRepository.countByStatus(ReportStatus.PENDING))
                .unreadNotifications(adminNotificationRepository.countByIsReadFalse())
                .build();
    }

    public List<RecentActivityDto> getRecentActivities() {
        return auditLogRepository.findAll(PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent()
                .stream()
                .map(this::convertToRecentActivityDto)
                .collect(Collectors.toList());
    }

    private RecentActivityDto convertToRecentActivityDto(AuditLog log) {
        String adminName = log.getAdmin() != null ? log.getAdmin().getFullName() : "Hệ thống";
        String description = adminName + " đã thực hiện hành động: " + log.getAction() + " trên " + log.getEntityType() + " #" + log.getEntityId();
        return RecentActivityDto.builder()
                .activityType(log.getAction())
                .title(log.getAction())
                .description(description)
                .actionUrl("/admin/" + log.getEntityType().toLowerCase() + "s/" + log.getEntityId())
                .icon(log.getEntityType())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
