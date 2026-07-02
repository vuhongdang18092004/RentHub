package com.ioc.internship.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateConversationRequest {

    @NotNull(message = "ID người nhận không được để trống")
    private Long recipientId;
}
