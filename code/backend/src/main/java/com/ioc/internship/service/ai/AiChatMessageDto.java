package com.ioc.internship.service.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatMessageDto {
    private String role; // "user", "model"
    private String textContent;
    
    // For function calling (when role = "model" and it decides to call a tool)
    private List<AIToolCall> toolCalls;
    
    // For function responses (when role = "user" providing tool output back)
    private List<AIToolResponse> toolResponses;
}
