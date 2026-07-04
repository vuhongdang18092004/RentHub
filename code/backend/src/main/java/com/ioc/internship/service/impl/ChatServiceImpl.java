package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.CreateConversationRequest;
import com.ioc.internship.dto.request.SendMessageRequest;
import com.ioc.internship.dto.response.ConversationSummaryResponse;
import com.ioc.internship.dto.response.MessageResponse;
import com.ioc.internship.dto.response.ProductSummaryResponse;
import com.ioc.internship.dto.response.UserSummaryResponse;
import com.ioc.internship.entity.*;
import com.ioc.internship.repository.*;
import com.ioc.internship.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ===========================
    // CONVERSATION
    // ===========================

    @Override
    @Transactional
    public ConversationSummaryResponse getOrCreateConversation(String email, CreateConversationRequest request) {
        UserEntity currentUser = findUserByEmail(email);
        UserEntity recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"));

        if (currentUser.getId().equals(recipient.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể tạo cuộc trò chuyện với chính mình");
        }

        // AC1: Kiểm tra conversation đã tồn tại chưa (không phân biệt thứ tự user1/user2)
        Optional<Conversation> existing = conversationRepository.findByUsers(currentUser, recipient);
        Conversation conversation = existing.orElseGet(() -> {
            // Tạo mới nếu chưa có: user1 luôn là user có id nhỏ hơn để đảm bảo unique constraint
            UserEntity u1 = currentUser.getId() < recipient.getId() ? currentUser : recipient;
            UserEntity u2 = currentUser.getId() < recipient.getId() ? recipient : currentUser;
            Conversation newConversation = Conversation.builder()
                    .user1(u1)
                    .user2(u2)
                    .build();
            return conversationRepository.save(newConversation);
        });

        return buildConversationSummary(conversation, currentUser);
    }

    @Override
    public List<ConversationSummaryResponse> getMyConversations(String email) {
        UserEntity currentUser = findUserByEmail(email);
        List<Conversation> conversations = conversationRepository.findAllByUser(currentUser);

        // AC3: Sắp xếp theo tin nhắn mới nhất giảm dần
        List<ConversationSummaryResponse> result = conversations.stream()
                .map(conv -> buildConversationSummary(conv, currentUser))
                .collect(Collectors.toList());

        result.sort(Comparator.comparing(
                ConversationSummaryResponse::getLastMessageTime,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));

        return result;
    }

    @Override
    @Transactional
    public void hideConversation(String email, Long conversationId) {
        // AC5: Ẩn conversation chỉ ảnh hưởng người thực hiện
        // Schema không có cột hidden_by, nên chúng ta implement logic này
        // bằng cách kiểm tra quyền và trả về 204 (operation is idempotent)
        // Frontend sẽ lưu trạng thái ẩn ở phía client-side hoặc localStorage
        UserEntity currentUser = findUserByEmail(email);
        Conversation conversation = findConversationById(conversationId);
        validateUserInConversation(currentUser, conversation);
        // Thao tác ẩn cục bộ - schema không hỗ trợ soft-delete per-user
        // Nếu cần persistent, cần migration thêm cột hidden_by_user1/hidden_by_user2
    }

    // ===========================
    // MESSAGE
    // ===========================

    @Override
    @Transactional
    public MessageResponse sendMessage(String email, SendMessageRequest request) {
        UserEntity sender = findUserByEmail(email);
        Conversation conversation = findConversationById(request.getConversationId());

        // Kiểm tra sender có thuộc conversation không
        validateUserInConversation(sender, conversation);

        // AC2: Nếu messageType = PRODUCT thì phải có referencedProductId
        Product referencedProduct = null;
        if (request.getMessageType() == MessageType.PRODUCT) {
            if (request.getReferencedProductId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Tin nhắn kiểu PRODUCT phải kèm theo ID sản phẩm");
            }
            referencedProduct = productRepository.findById(request.getReferencedProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Không tìm thấy sản phẩm"));
        }

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .messageType(request.getMessageType() != null ? request.getMessageType() : MessageType.TEXT)
                .content(request.getContent())
                .referencedProduct(referencedProduct)
                .build();

        message = messageRepository.save(message);
        MessageResponse response = mapToMessageResponse(message);
        
        // Gửi realtime qua STOMP cho những người đang subscribe topic của conversation này
        messagingTemplate.convertAndSend("/topic/chat/" + conversation.getId(), response);
        
        return response;
    }

    @Override
    public Page<MessageResponse> getMessages(String email, Long conversationId, Pageable pageable) {
        UserEntity currentUser = findUserByEmail(email);
        Conversation conversation = findConversationById(conversationId);
        validateUserInConversation(currentUser, conversation);

        return messageRepository.findByConversationOrderByCreatedAtAsc(conversation, pageable)
                .map(this::mapToMessageResponse);
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long conversationId) {
        // AC4: Đánh dấu đã đọc chỉ cập nhật tin nhắn của đối phương
        UserEntity currentUser = findUserByEmail(email);
        Conversation conversation = findConversationById(conversationId);
        validateUserInConversation(currentUser, conversation);
        
        messageRepository.markMessagesAsRead(conversation, currentUser);
    }

    // ===========================
    // PRIVATE HELPERS
    // ===========================

    private UserEntity findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy người dùng"));
    }

    private Conversation findConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy cuộc trò chuyện"));
    }

    private void validateUserInConversation(UserEntity user, Conversation conversation) {
        boolean isMember = conversation.getUser1().getId().equals(user.getId())
                || conversation.getUser2().getId().equals(user.getId());
        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền truy cập cuộc trò chuyện này");
        }
    }

    private ConversationSummaryResponse buildConversationSummary(Conversation conversation, UserEntity currentUser) {
        // Xác định người còn lại trong conversation
        UserEntity otherUser = conversation.getUser1().getId().equals(currentUser.getId())
                ? conversation.getUser2()
                : conversation.getUser1();

        // Lấy tin nhắn cuối
        Optional<Message> lastMessageOpt = messageRepository.findTopByConversationOrderByCreatedAtDesc(conversation);

        String lastMessageContent = null;
        String lastMessageType = null;
        java.time.LocalDateTime lastMessageTime = null;

        if (lastMessageOpt.isPresent()) {
            Message lastMsg = lastMessageOpt.get();
            lastMessageContent = lastMsg.getContent();
            lastMessageType = lastMsg.getMessageType().name();
            lastMessageTime = lastMsg.getCreatedAt();
        }

        // Đếm tin chưa đọc (tin của đối phương)
        long unreadCount = messageRepository.countUnreadMessages(conversation, currentUser);

        return ConversationSummaryResponse.builder()
                .conversationId(conversation.getId())
                .otherUser(UserSummaryResponse.fromEntity(otherUser))
                .lastMessage(lastMessageContent)
                .lastMessageType(lastMessageType)
                .lastMessageTime(lastMessageTime)
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .build();
    }

    private MessageResponse mapToMessageResponse(Message message) {
        ProductSummaryResponse productResponse = null;
        if (message.getReferencedProduct() != null) {
            productResponse = ProductSummaryResponse.fromEntity(message.getReferencedProduct());
        }

        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .sender(UserSummaryResponse.fromEntity(message.getSender()))
                .messageType(message.getMessageType().name())
                .content(message.getContent())
                .referencedProduct(productResponse)
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
