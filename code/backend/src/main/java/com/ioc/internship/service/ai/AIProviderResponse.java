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
public class AIProviderResponse {
    private String text;
    private List<AIToolCall> toolCalls;
    private Integer promptTokens;
    private Integer completionTokens;
    private Integer totalTokens;
    private String rawRequest;
    private String rawResponse;
    private Long responseTimeMs;
}
