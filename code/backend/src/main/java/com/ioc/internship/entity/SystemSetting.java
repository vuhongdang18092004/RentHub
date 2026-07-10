package com.ioc.internship.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "commission_rate", nullable = false)
    @Builder.Default
    private Double commissionRate = 0.05; // 5% default

    @Column(name = "max_rental_days", nullable = false)
    @Builder.Default
    private Integer maxRentalDays = 30;

    @Column(name = "default_deposit_percent", nullable = false)
    @Builder.Default
    private Double defaultDepositPercent = 0.5; // 50% default

    @Column(name = "maintenance_mode", nullable = false)
    @Builder.Default
    private Boolean maintenanceMode = false;

    @Column(name = "ai_enabled", nullable = false)
    @Builder.Default
    private Boolean aiEnabled = true;

    @Column(name = "notification_enabled", nullable = false)
    @Builder.Default
    private Boolean notificationEnabled = true;

    @Column(name = "review_moderation_enabled", nullable = false)
    @Builder.Default
    private Boolean reviewModerationEnabled = true;
}
