package com.ioc.internship.service;

import com.ioc.internship.entity.SystemSetting;
import com.ioc.internship.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final AuditLogService auditLogService;

    public SystemSetting getSettings() {
        return systemSettingRepository.findById(1L)
                .orElseGet(() -> systemSettingRepository.save(new SystemSetting()));
    }

    @Transactional
    public SystemSetting updateSettings(Long adminId, SystemSetting newSettings) {
        SystemSetting current = getSettings();
        
        String oldVal = current.toString();
        
        current.setCommissionRate(newSettings.getCommissionRate());
        current.setMaxRentalDays(newSettings.getMaxRentalDays());
        current.setDefaultDepositPercent(newSettings.getDefaultDepositPercent());
        current.setMaintenanceMode(newSettings.getMaintenanceMode());
        current.setAiEnabled(newSettings.getAiEnabled());
        current.setNotificationEnabled(newSettings.getNotificationEnabled());
        current.setReviewModerationEnabled(newSettings.getReviewModerationEnabled());

        SystemSetting saved = systemSettingRepository.save(current);
        
        auditLogService.log(adminId, "UPDATE_SYSTEM_SETTINGS", "SystemSetting", saved.getId(), oldVal, saved.toString());
        
        return saved;
    }
}
