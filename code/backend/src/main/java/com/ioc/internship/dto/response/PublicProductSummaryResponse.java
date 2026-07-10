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
public class PublicProductSummaryResponse {
    private Long id;
    private String name;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private String address;
    private String categoryName;
    private String ownerFullName;
    private String primaryImageUrl;
    private ProductStatus status;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;

    public static PublicProductSummaryResponse fromEntity(Product product) {
        if (product == null) {
            return null;
        }

        String primaryImageUrl = null;
        if (product.getImages() != null) {
            primaryImageUrl = product.getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(ProductImage::getImageUrl)
                    .findFirst()
                    .orElse(product.getImages().isEmpty() ? null : product.getImages().get(0).getImageUrl());
        }

        return PublicProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .pricePerDay(product.getPricePerDay())
                .depositAmount(product.getDepositAmount())
                .address(product.getAddress())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .ownerFullName(product.getOwner() != null ? product.getOwner().getFullName() : null)
                .primaryImageUrl(primaryImageUrl)
                .status(product.getStatus())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
