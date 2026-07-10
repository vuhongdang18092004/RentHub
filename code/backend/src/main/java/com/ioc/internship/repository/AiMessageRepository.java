package com.ioc.internship.repository;

import com.ioc.internship.entity.AiConversation;
import com.ioc.internship.entity.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiMessageRepository extends JpaRepository<AiMessage, Long> {
    List<AiMessage> findAllByConversationOrderByCreatedAtAsc(AiConversation conversation);
    long count();
}
