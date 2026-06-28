package com.ioc.internship.dto.response;

import com.ioc.internship.entity.ProductImage;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductImageResponse {
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;

    public static ProductImageResponse fromEntity(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.getIsPrimary())
                .build();
    }
}
