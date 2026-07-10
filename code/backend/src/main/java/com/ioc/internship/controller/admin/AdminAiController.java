package com.ioc.internship.controller.admin;

import com.ioc.internship.repository.AiConversationRepository;
import com.ioc.internship.repository.AiMessageRepository;
import com.ioc.internship.repository.AiUsageLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/ai")
@RequiredArgsConstructor
public class AdminAiController {

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final AiUsageLogRepository usageLogRepository;

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalConversations = conversationRepository.countByIsDeletedFalse();
        long totalMessages = messageRepository.count();
        Long totalPromptTokens = usageLogRepository.sumPromptTokens();
        Long totalCompletionTokens = usageLogRepository.sumCompletionTokens();
        BigDecimal totalCost = usageLogRepository.sumEstimatedCost();
        Double avgLatency = usageLogRepository.averageResponseTime();

        stats.put("totalConversations", totalConversations);
        stats.put("totalMessages", totalMessages);
        stats.put("totalPromptTokens", totalPromptTokens != null ? totalPromptTokens : 0);
        stats.put("totalCompletionTokens", totalCompletionTokens != null ? totalCompletionTokens : 0);
        stats.put("estimatedGeminiCost", totalCost != null ? totalCost : BigDecimal.ZERO);
        stats.put("averageResponseTimeMs", avgLatency != null ? avgLatency : 0.0);

        return ResponseEntity.ok(stats);
    }
}
