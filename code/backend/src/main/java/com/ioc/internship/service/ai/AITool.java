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
public class AITool {
    private String name;
    private String description;
    private Map<String, Object> parameters; // JSON schema for parameters
}
