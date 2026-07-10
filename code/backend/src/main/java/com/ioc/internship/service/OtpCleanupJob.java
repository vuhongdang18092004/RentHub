package com.ioc.internship.service;

import com.ioc.internship.entity.OtpStatus;
import com.ioc.internship.repository.EmailOtpRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpCleanupJob {

    private final EmailOtpRepository emailOtpRepository;

    @Scheduled(cron = "0 0 * * * *") // Chạy mỗi giờ
    @Transactional
    public void cleanupOldOtps() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);
        List<OtpStatus> removableStatuses = List.of(OtpStatus.VERIFIED, OtpStatus.EXPIRED, OtpStatus.INVALIDATED);
        
        emailOtpRepository.deleteByStatusInAndCreatedAtBefore(removableStatuses, threshold);
        log.info("Audit: CLEANUP_OLD_OTPS - Deleted OTPs older than 30 days");
    }
}
