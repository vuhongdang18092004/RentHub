package com.ioc.internship.service.ai;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.Map;
import java.time.LocalDateTime;

@Component
public class AiRateLimiter {
    
    // Limits
    private static final int REQ_PER_MINUTE = 20;
    private static final int REQ_PER_DAY = 200;

    // Trackers
    private final Map<Long, UserRateTracker> userTrackers = new ConcurrentHashMap<>();

    private static class UserRateTracker {
        AtomicInteger minuteCount = new AtomicInteger(0);
        LocalDateTime minuteStart = LocalDateTime.now();
        
        AtomicInteger dayCount = new AtomicInteger(0);
        LocalDateTime dayStart = LocalDateTime.now();
    }

    public void checkAndConsume(Long userId) {
        UserRateTracker tracker = userTrackers.computeIfAbsent(userId, k -> new UserRateTracker());
        
        LocalDateTime now = LocalDateTime.now();
        
        // Reset minute
        if (now.minusMinutes(1).isAfter(tracker.minuteStart)) {
            tracker.minuteCount.set(0);
            tracker.minuteStart = now;
        }
        
        // Reset day
        if (now.minusDays(1).isAfter(tracker.dayStart)) {
            tracker.dayCount.set(0);
            tracker.dayStart = now;
        }

        if (tracker.minuteCount.get() >= REQ_PER_MINUTE) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đang gửi tin nhắn quá nhanh. Vui lòng thử lại sau một lát.");
        }
        
        if (tracker.dayCount.get() >= REQ_PER_DAY) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đã đạt giới hạn sử dụng AI hôm nay. Vui lòng thử lại vào ngày mai.");
        }
        
        tracker.minuteCount.incrementAndGet();
        tracker.dayCount.incrementAndGet();
    }
}
