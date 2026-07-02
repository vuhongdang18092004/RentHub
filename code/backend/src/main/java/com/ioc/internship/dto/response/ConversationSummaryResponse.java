package com.ioc.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConversationSummaryResponse {
    private Long conversationId;
    private UserSummaryResponse otherUser;   // Người đang chat cùng
    private String lastMessage;              // Nội dung tin nhắn cuối
    private String lastMessageType;          // TEXT / PRODUCT / IMAGE
    private LocalDateTime lastMessageTime;   // Thời gian tin nhắn cuối
    private long unreadCount;               // Số tin chưa đọc (của đối phương gửi)
    private LocalDateTime createdAt;
}
