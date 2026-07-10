package com.ioc.internship.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private String activityType; // "RENTAL_CREATED", "PRODUCT_APPROVED", "USER_LOCKED"
    private String title;
    private String description;
    private String actionUrl;
    private String icon;
    private LocalDateTime createdAt;
}
