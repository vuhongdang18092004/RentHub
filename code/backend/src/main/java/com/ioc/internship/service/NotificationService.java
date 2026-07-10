package com.ioc.internship.service;

import com.ioc.internship.dto.request.NotificationCreateCommand;
import com.ioc.internship.dto.response.NotificationResponse;
import com.ioc.internship.dto.response.NotificationSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void create(NotificationCreateCommand command);
    
    Page<NotificationResponse> getMyNotifications(String email, Pageable pageable);
    
    List<NotificationResponse> getRecentNotifications(String email, int size);
    
    NotificationSummaryResponse getUnreadCount(String email);
    
    void markAsRead(String email, Long id);
    
    void markAllAsRead(String email);
    
    void deleteNotification(String email, Long id);
}
