package com.ioc.internship.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingInterceptor implements HandlerInterceptor {

    // Giới hạn siêu đơn giản in-memory: IP -> { timestamp -> count }
    private final Map<String, RequestCounter> otpRequests = new ConcurrentHashMap<>();
    private final Map<String, RequestCounter> verifyRequests = new ConcurrentHashMap<>();

    private static class RequestCounter {
        long resetTime;
        int count;

        RequestCounter(long resetTime, int count) {
            this.resetTime = resetTime;
            this.count = count;
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();
        String clientIp = request.getRemoteAddr();

        if (uri.endsWith("/register") || uri.endsWith("/forgot-password") || uri.endsWith("/resend-register-otp")) {
            if (!allowRequest(otpRequests, clientIp, 50, 86400000)) { // 50 requests / 1 day
                response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "Too many OTP requests from this IP.");
                return false;
            }
        }

        if (uri.endsWith("/verify-register-otp") || uri.endsWith("/reset-password")) {
            if (!allowRequest(verifyRequests, clientIp, 10, 60000)) { // 10 requests / 1 min
                response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "Too many verify attempts from this IP.");
                return false;
            }
        }

        return true;
    }

    private synchronized boolean allowRequest(Map<String, RequestCounter> map, String key, int maxRequests, long timeWindowMs) {
        long now = System.currentTimeMillis();
        RequestCounter counter = map.get(key);

        if (counter == null || now > counter.resetTime) {
            map.put(key, new RequestCounter(now + timeWindowMs, 1));
            return true;
        }

        if (counter.count < maxRequests) {
            counter.count++;
            return true;
        }

        return false;
    }
}
