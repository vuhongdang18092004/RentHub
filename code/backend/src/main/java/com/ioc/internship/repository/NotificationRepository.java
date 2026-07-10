package com.ioc.internship.repository;

import com.ioc.internship.entity.Notification;
import com.ioc.internship.entity.NotificationType;
import com.ioc.internship.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(UserEntity user, Pageable pageable);

    long countByUserAndIsReadFalseAndIsDeletedFalse(UserEntity user);

    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isDeleted = false ORDER BY n.createdAt DESC")
    Page<Notification> findRecentNotifications(@Param("user") UserEntity user, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(n) > 0 THEN true ELSE false END " +
            "FROM Notification n " +
            "WHERE n.user = :user " +
            "AND n.type = :type " +
            "AND n.actionUrl = :actionUrl " +
            "AND n.createdAt > :since " +
            "AND n.isDeleted = false")
    boolean existsDuplicateNotification(
            @Param("user") UserEntity user,
            @Param("type") NotificationType type,
            @Param("actionUrl") String actionUrl,
            @Param("since") LocalDateTime since
    );

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user = :user AND n.isRead = false AND n.isDeleted = false")
    void markAllAsReadByUser(@Param("user") UserEntity user);
}
