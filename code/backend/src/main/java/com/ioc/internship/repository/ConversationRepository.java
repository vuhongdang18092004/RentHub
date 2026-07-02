package com.ioc.internship.repository;

import com.ioc.internship.entity.Conversation;
import com.ioc.internship.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    // Tìm conversation giữa 2 user (không phân biệt thứ tự user1/user2 theo constraint DB)
    @Query("SELECT c FROM Conversation c WHERE (c.user1 = :u1 AND c.user2 = :u2) OR (c.user1 = :u2 AND c.user2 = :u1)")
    Optional<Conversation> findByUsers(@Param("u1") UserEntity u1, @Param("u2") UserEntity u2);

    // Lấy tất cả conversations của một user (tham gia với tư cách user1 hoặc user2)
    // Sắp xếp theo tin nhắn mới nhất trong conversation - sẽ sort ở service sau khi tổng hợp last message
    @Query("SELECT c FROM Conversation c WHERE c.user1 = :user OR c.user2 = :user")
    List<Conversation> findAllByUser(@Param("user") UserEntity user);
}
