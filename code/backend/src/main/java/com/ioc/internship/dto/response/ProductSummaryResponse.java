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
    private ProductStatus status;
    private CategoryResponse category;
    private String primaryImage;
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
                .status(product.getStatus())
                .category(CategoryResponse.fromEntity(product.getCategory()))
                .primaryImage(primaryImageUrl)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
