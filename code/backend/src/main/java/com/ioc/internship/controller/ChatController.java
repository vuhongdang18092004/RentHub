package com.ioc.internship.controller;

import com.ioc.internship.dto.request.CreateConversationRequest;
import com.ioc.internship.dto.request.SendMessageRequest;
import com.ioc.internship.dto.response.ConversationSummaryResponse;
import com.ioc.internship.dto.response.MessageResponse;
import com.ioc.internship.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // ===========================
    // CONVERSATION ENDPOINTS
    // ===========================

    /**
     * POST /api/chat/conversations
     * Tạo mới hoặc lấy lại conversation hiện có với người dùng khác.
     * AC1: Không tạo conversation trùng.
     */
    @PostMapping("/conversations")
    public ResponseEntity<ConversationSummaryResponse> getOrCreateConversation(
            Authentication authentication,
            @Valid @RequestBody CreateConversationRequest request) {
        String email = authentication.getName();
        return new ResponseEntity<>(chatService.getOrCreateConversation(email, request), HttpStatus.OK);
    }

    /**
     * GET /api/chat/conversations
     * Lấy danh sách tất cả conversations của user hiện tại.
     * AC3: Sắp xếp theo tin nhắn mới nhất giảm dần.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationSummaryResponse>> getMyConversations(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(chatService.getMyConversations(email));
    }

    /**
     * DELETE /api/chat/conversations/{id}
     * Ẩn conversation khỏi danh sách của riêng mình.
     * AC5: Chỉ ảnh hưởng người thực hiện.
     */
    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> hideConversation(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        chatService.hideConversation(email, id);
        return ResponseEntity.noContent().build();
    }

    // ===========================
    // MESSAGE ENDPOINTS
    // ===========================

    /**
     * POST /api/chat/messages
     * Gửi tin nhắn vào một conversation.
     * AC2: Tin nhắn PRODUCT phải có referencedProductId.
     */
    @PostMapping("/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            Authentication authentication,
            @Valid @RequestBody SendMessageRequest request) {
        String email = authentication.getName();
        return new ResponseEntity<>(chatService.sendMessage(email, request), HttpStatus.CREATED);
    }

    /**
     * GET /api/chat/conversations/{id}/messages
     * Lấy lịch sử tin nhắn của conversation (phân trang, tăng dần theo thời gian).
     */
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<Page<MessageResponse>> getMessages(
            Authentication authentication,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String email = authentication.getName();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        return ResponseEntity.ok(chatService.getMessages(email, id, pageable));
    }

    /**
     * PUT /api/chat/conversations/{id}/read
     * Đánh dấu đã đọc tất cả tin nhắn chưa đọc của đối phương trong conversation.
     * AC4: Chỉ cập nhật tin của đối phương.
     */
    @PutMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markAsRead(Authentication authentication, @PathVariable Long id) {
        String email = authentication.getName();
        chatService.markAsRead(email, id);
        return ResponseEntity.ok().build();
    }
}
