package com.ioc.internship.repository.specification;

import com.ioc.internship.entity.Report;
import com.ioc.internship.entity.ReportStatus;
import org.springframework.data.jpa.domain.Specification;

public class ReportSpecification {

    public static Specification<Report> hasStatus(ReportStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) return null;
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Report> hasRentalId(Long rentalId) {
        return (root, query, criteriaBuilder) -> {
            if (rentalId == null) return null;
            return criteriaBuilder.equal(root.join("rental").get("id"), rentalId);
        };
    }

    public static Specification<Report> hasProductId(Long productId) {
        return (root, query, criteriaBuilder) -> {
            if (productId == null) return null;
            return criteriaBuilder.equal(root.join("product").get("id"), productId);
        };
    }

    public static Specification<Report> hasReporterId(Long reporterId) {
        return (root, query, criteriaBuilder) -> {
            if (reporterId == null) return null;
            return criteriaBuilder.equal(root.join("reporter").get("id"), reporterId);
        };
    }

    public static Specification<Report> hasReportedUserId(Long reportedUserId) {
        return (root, query, criteriaBuilder) -> {
            if (reportedUserId == null) return null;
            return criteriaBuilder.equal(root.join("reportedUser").get("id"), reportedUserId);
        };
    }
}
