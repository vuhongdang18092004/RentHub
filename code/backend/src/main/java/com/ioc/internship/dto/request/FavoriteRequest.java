package com.ioc.internship.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FavoriteRequest {
    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;
}
