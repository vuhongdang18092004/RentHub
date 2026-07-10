package com.ioc.internship.service.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIToolResponse {
    private String toolCallId;
    private String name;
    private String content; // JSON string representation of the response
}
