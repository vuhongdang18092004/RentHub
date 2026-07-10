package com.ioc.internship.service.ai;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.ioc.internship.entity.AiConversation;
import com.ioc.internship.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class AISecurityValidator {

    public void validateOwnership(AiConversation conversation, UserEntity currentUser) {
        if (!conversation.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập cuộc hội thoại này.");
        }
    }

    public void validatePromptInjection(String input) {
        // Simple heuristic for prompt injection / jailbreak attempts
        String lowerInput = input.toLowerCase();
        if (lowerInput.contains("ignore previous instructions") || 
            lowerInput.contains("forget previous instructions") ||
            lowerInput.contains("system prompt") ||
            lowerInput.contains("bypass") ||
            lowerInput.contains("bỏ qua các chỉ thị trước")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung không hợp lệ hoặc vi phạm chính sách bảo mật.");
        }
    }
}
