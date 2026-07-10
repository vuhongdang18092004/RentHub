package com.ioc.internship.service.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIToolCall {
    private String id;
    private String name;
    private Map<String, Object> arguments;
}
