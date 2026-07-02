package com.ioc.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private Long conversationId;
    private UserSummaryResponse sender;
    private String messageType;
    private String content;
    private ProductSummaryResponse referencedProduct; // Thông tin sản phẩm đính kèm (nếu type = PRODUCT)
    private Boolean isRead;
    private LocalDateTime createdAt;
}
