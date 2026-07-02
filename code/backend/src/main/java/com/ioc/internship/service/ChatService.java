package com.ioc.internship.service;

import com.ioc.internship.dto.request.CreateConversationRequest;
import com.ioc.internship.dto.request.SendMessageRequest;
import com.ioc.internship.dto.response.ConversationSummaryResponse;
import com.ioc.internship.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatService {

    // Conversation
    ConversationSummaryResponse getOrCreateConversation(String email, CreateConversationRequest request);
    List<ConversationSummaryResponse> getMyConversations(String email);
    void hideConversation(String email, Long conversationId);

    // Message
    MessageResponse sendMessage(String email, SendMessageRequest request);
    Page<MessageResponse> getMessages(String email, Long conversationId, Pageable pageable);
    void markAsRead(String email, Long conversationId);
}
