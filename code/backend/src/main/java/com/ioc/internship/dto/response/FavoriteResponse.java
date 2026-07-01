package com.ioc.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FavoriteResponse {
    private Long favoriteId;
    private Long productId;
    private String productName;
    private String thumbnail;
    private BigDecimal rentalPrice;
    private String productStatus;
    private String productStatusMessage;
    private LocalDateTime createdAt;
}
