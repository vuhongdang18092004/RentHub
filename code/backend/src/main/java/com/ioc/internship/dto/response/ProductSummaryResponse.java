package com.ioc.internship.dto.response;

import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductImage;
import com.ioc.internship.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductSummaryResponse {
    private Long id;
    private String name;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private String address;
    private ProductStatus status;
    private CategoryResponse category;
    private String categoryName;
    private String ownerName;
    private String primaryImageUrl;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;

    public static ProductSummaryResponse fromEntity(Product product) {
        String primaryImageUrl = product.getImages().stream()
                .filter(ProductImage::getIsPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .pricePerDay(product.getPricePerDay())
                .depositAmount(product.getDepositAmount())
                .address(product.getAddress())
                .status(product.getStatus())
                .category(CategoryResponse.fromEntity(product.getCategory()))
                .categoryName(product.getCategory().getName())
                .ownerName(product.getOwner().getFullName())
                .primaryImageUrl(primaryImageUrl)
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
