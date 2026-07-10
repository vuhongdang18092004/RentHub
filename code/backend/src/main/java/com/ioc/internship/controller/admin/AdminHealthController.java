package com.ioc.internship.controller.admin;

import com.ioc.internship.entity.SystemSetting;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.UserRepository;
import com.ioc.internship.service.SystemHealthService;
import com.ioc.internship.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminHealthController {

    private final SystemHealthService systemHealthService;
    private final SystemSettingService systemSettingService;
    private final UserRepository userRepository;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        return ResponseEntity.ok(systemHealthService.getSystemHealth());
    }

    @GetMapping("/settings")
    public ResponseEntity<SystemSetting> getSettings() {
        return ResponseEntity.ok(systemSettingService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SystemSetting> updateSettings(@RequestBody SystemSetting settings, Authentication authentication) {
        String email = authentication.getName();
        UserEntity admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return ResponseEntity.ok(systemSettingService.updateSettings(admin.getId(), settings));
    }
}
