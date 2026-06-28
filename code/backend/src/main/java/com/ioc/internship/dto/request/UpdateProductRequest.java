package com.ioc.internship.dto.request;

import com.ioc.internship.entity.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price per day is required")
    @Positive(message = "Price per day must be greater than 0")
    private BigDecimal pricePerDay;

    @NotNull(message = "Deposit amount is required")
    @PositiveOrZero(message = "Deposit amount must be greater than or equal to 0")
    private BigDecimal depositAmount;

    private String address;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private List<ProductImageRequest> images;

    @NotNull(message = "Status is required")
    private ProductStatus status;
}
