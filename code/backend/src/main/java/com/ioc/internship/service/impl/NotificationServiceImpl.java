package com.ioc.internship.service.impl;

import com.ioc.internship.dto.request.NotificationCreateCommand;
import com.ioc.internship.dto.response.NotificationResponse;
import com.ioc.internship.dto.response.NotificationSummaryResponse;
import com.ioc.internship.entity.Notification;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.NotificationRepository;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void create(NotificationCreateCommand command) {
        try {
            // Anti-spam / Duplicate prevention: check last 5 minutes
            LocalDateTime since = LocalDateTime.now().minusMinutes(5);
            boolean exists = notificationRepository.existsDuplicateNotification(
                    command.getUser(),
                    command.getType(),
                    command.getActionUrl(),
                    since
            );

            if (exists) {
                log.debug("Duplicate notification prevented for user: {} and actionUrl: {}", 
                        command.getUser().getId(), command.getActionUrl());
                return;
            }

            Notification notification = Notification.builder()
                    .user(command.getUser())
                    .title(command.getTitle())
                    .message(command.getMessage())
                    .type(command.getType())
                    .actionUrl(command.getActionUrl())
                    .isRead(false)
                    .isDeleted(false)
                    .build();

            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to create notification. Error: {}", e.getMessage(), e);
            // We swallow the exception to not roll back the parent transaction
        }
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("404 Not Found: User not found"));
    }

    @Override
    public Page<NotificationResponse> getMyNotifications(String email, Pageable pageable) {
        UserEntity user = getUserByEmail(email);
        return notificationRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(user, pageable)
                .map(NotificationResponse::fromEntity);
    }

    @Override
    public List<NotificationResponse> getRecentNotifications(String email, int size) {
        UserEntity user = getUserByEmail(email);
        Pageable pageable = PageRequest.of(0, size);
        return notificationRepository.findRecentNotifications(user, pageable)
                .stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationSummaryResponse getUnreadCount(String email) {
        UserEntity user = getUserByEmail(email);
        long count = notificationRepository.countByUserAndIsReadFalseAndIsDeletedFalse(user);
        return NotificationSummaryResponse.builder().unreadCount(count).build();
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long id) {
        UserEntity user = getUserByEmail(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("403 Forbidden: Not your notification");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        UserEntity user = getUserByEmail(email);
        notificationRepository.markAllAsReadByUser(user);
    }

    @Override
    @Transactional
    public void deleteNotification(String email, Long id) {
        UserEntity user = getUserByEmail(email);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("404 Not Found: Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("403 Forbidden: Not your notification");
        }

        notification.setDeleted(true);
        notificationRepository.save(notification);
    }
}
