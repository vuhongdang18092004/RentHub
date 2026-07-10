package com.ioc.internship.repository;

import com.ioc.internship.entity.AiConversation;
import com.ioc.internship.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {
    List<AiConversation> findAllByUserAndIsDeletedFalseOrderByUpdatedAtDesc(UserEntity user);
    Optional<AiConversation> findByIdAndUserAndIsDeletedFalse(Long id, UserEntity user);
    long countByIsDeletedFalse();
}
