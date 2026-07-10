package com.ioc.internship.dto.request;

import com.ioc.internship.entity.NotificationType;
import com.ioc.internship.entity.UserEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationCreateCommand {
    private UserEntity user;
    private String title;
    private String message;
    private NotificationType type;
    private String actionUrl;
}
