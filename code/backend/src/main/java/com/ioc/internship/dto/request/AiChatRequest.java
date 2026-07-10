package com.ioc.internship.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiChatRequest {
    @NotBlank(message = "Content cannot be empty")
    private String content;

    private Long conversationId; // if null, create a new conversation
}
