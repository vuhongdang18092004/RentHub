package com.ioc.internship.dto.request;

import com.ioc.internship.entity.ProductStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMyProductStatusRequest {
    @NotNull(message = "Status is required")
    private ProductStatus status;
}
