package com.ioc.internship.repository;

import com.ioc.internship.entity.Conversation;
import com.ioc.internship.entity.Message;
import com.ioc.internship.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Lấy tin nhắn theo conversation, sắp xếp tăng dần (lịch sử chat)
    Page<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation, Pageable pageable);

    // Lấy tin nhắn cuối cùng của một conversation (để hiển thị preview)
    Optional<Message> findTopByConversationOrderByCreatedAtDesc(Conversation conversation);

    // Đếm số tin nhắn chưa đọc trong conversation (tin của đối phương)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation = :conversation AND m.sender != :currentUser AND m.isRead = false")
    long countUnreadMessages(@Param("conversation") Conversation conversation,
                             @Param("currentUser") UserEntity currentUser);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation = :conversation AND m.sender != :currentUser AND m.isRead = false")
    void markMessagesAsRead(@Param("conversation") Conversation conversation,
                            @Param("currentUser") UserEntity currentUser);
}
