package com.ioc.internship.repository.specification;

import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> buildPublicFilters(
            String keyword, List<Long> categoryIds, BigDecimal minPrice, BigDecimal maxPrice,
            String address, BigDecimal latitude, BigDecimal longitude, Double radius) {
        
        return (root, query, cb) -> {
            // Cấu hình fetch join để tránh N+1 Query
            if (Long.class != query.getResultType()) {
                root.fetch("category", JoinType.LEFT);
                root.fetch("owner", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            // Chỉ lấy sản phẩm AVAILABLE
            predicates.add(cb.equal(root.get("status"), ProductStatus.AVAILABLE));

            // Keyword (name, description, address, category.name)
            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
                Predicate addressMatch = cb.like(cb.lower(root.get("address")), pattern);
                Predicate catMatch = cb.like(cb.lower(root.get("category").get("name")), pattern);
                predicates.add(cb.or(nameMatch, descMatch, addressMatch, catMatch));
            }

            // Category filter
            if (categoryIds != null && !categoryIds.isEmpty()) {
                predicates.add(root.get("category").get("id").in(categoryIds));
            }

            // Price filter
            if (minPrice != null && maxPrice != null) {
                predicates.add(cb.between(root.get("pricePerDay"), minPrice, maxPrice));
            } else if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("pricePerDay"), minPrice));
            } else if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), maxPrice));
            }

            // Address filter (gần đúng) - bỏ qua nếu tìm kiếm theo tọa độ vĩ độ/kinh độ
            if (address != null && !address.trim().isEmpty() && (latitude == null || longitude == null)) {
                String addrPattern = "%" + address.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("address")), addrPattern));
            }

            // Location filter (Bounding Box) thay vì Haversine trực tiếp
            if (latitude != null && longitude != null && radius != null && radius > 0) {
                double lat = latitude.doubleValue();
                double lon = longitude.doubleValue();
                double r = radius;

                // 1 độ vĩ độ ~ 111.32 km
                double latDelta = r / 111.32;
                // 1 độ kinh độ ~ 111.32 * cos(vĩ độ) km
                double lonDelta = r / (111.32 * Math.cos(Math.toRadians(lat)));

                BigDecimal minLat = BigDecimal.valueOf(lat - latDelta);
                BigDecimal maxLat = BigDecimal.valueOf(lat + latDelta);
                BigDecimal minLon = BigDecimal.valueOf(lon - lonDelta);
                BigDecimal maxLon = BigDecimal.valueOf(lon + lonDelta);

                predicates.add(cb.between(root.get("latitude"), minLat, maxLat));
                predicates.add(cb.between(root.get("longitude"), minLon, maxLon));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
