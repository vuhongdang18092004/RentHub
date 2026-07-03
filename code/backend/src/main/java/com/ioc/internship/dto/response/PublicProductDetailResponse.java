package com.ioc.internship.dto.response;

import com.ioc.internship.entity.Product;
import com.ioc.internship.entity.ProductStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class PublicProductDetailResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private CategoryResponse category;
    private PublicOwnerResponse owner;
    private List<ProductImageResponse> images;

    public static PublicProductDetailResponse fromEntity(Product product) {
        if (product == null) {
            return null;
        }

        return PublicProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .pricePerDay(product.getPricePerDay())
                .depositAmount(product.getDepositAmount())
                .address(product.getAddress())
                .latitude(product.getLatitude())
                .longitude(product.getLongitude())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .category(product.getCategory() != null ? CategoryResponse.fromEntity(product.getCategory()) : null)
                .owner(PublicOwnerResponse.fromEntity(product.getOwner()))
                .images(product.getImages() != null ? 
                        product.getImages().stream().map(ProductImageResponse::fromEntity).collect(Collectors.toList()) : 
                        new ArrayList<>())
                .build();
    }
}
