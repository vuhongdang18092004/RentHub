package com.ioc.internship.dto.request;

import com.ioc.internship.entity.MessageType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotNull(message = "ID cuộc trò chuyện không được để trống")
    private Long conversationId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    private String content;

    private MessageType messageType = MessageType.TEXT;

    // Bắt buộc có nếu messageType = PRODUCT
    private Long referencedProductId;
}
