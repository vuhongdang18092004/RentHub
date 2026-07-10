package com.ioc.internship.dto.response;

import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class ProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private ProductStatus status;
    private CategoryResponse category;
    private UserSummaryResponse owner;
    private List<ProductImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductDetailResponse fromEntity(Product product) {
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .pricePerDay(product.getPricePerDay())
                .depositAmount(product.getDepositAmount())
                .address(product.getAddress())
                .latitude(product.getLatitude())
                .longitude(product.getLongitude())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .status(product.getStatus())
                .category(CategoryResponse.fromEntity(product.getCategory()))
                .owner(UserSummaryResponse.fromEntity(product.getOwner()))
                .images(product.getImages().stream().map(ProductImageResponse::fromEntity).collect(Collectors.toList()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
