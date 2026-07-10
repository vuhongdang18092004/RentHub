package com.ioc.internship.service.ai;

import java.util.List;

public interface AIProvider {
    /**
     * Retrieves the name of the model being used.
     */
    String getModelName();

    /**
     * Generates a response from the AI model given a list of messages and available tools.
     * 
     * @param messages The conversation history and current prompt.
     * @param systemInstruction The system instruction / prompt.
     * @param tools    The list of available tools the AI can call.
     * @return AIProviderResponse containing the text, tool calls, and usage statistics.
     */
    AIProviderResponse generateResponse(List<AiChatMessageDto> messages, String systemInstruction, List<AITool> tools);
    
}
