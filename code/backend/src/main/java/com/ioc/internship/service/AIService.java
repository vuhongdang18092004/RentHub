package com.ioc.internship.service;

import com.ioc.internship.dto.request.AiChatRequest;
import com.ioc.internship.dto.response.AiChatResponse;
import com.ioc.internship.dto.response.AiConversationResponse;
import com.ioc.internship.dto.response.AiMessageResponse;
import com.ioc.internship.entity.UserEntity;

import java.util.List;

public interface AIService {
    AiChatResponse chat(AiChatRequest request, UserEntity currentUser);
    List<AiConversationResponse> getConversations(UserEntity currentUser);
    AiConversationResponse getConversation(Long id, UserEntity currentUser);
    List<AiMessageResponse> getMessages(Long conversationId, UserEntity currentUser);
    void archiveConversation(Long id, UserEntity currentUser);
    void restoreConversation(Long id, UserEntity currentUser);
    void deleteConversation(Long id, UserEntity currentUser);
}
