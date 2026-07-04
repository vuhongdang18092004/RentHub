package com.ioc.internship.service;

import com.ioc.internship.entity.RentalRequest;
import com.ioc.internship.entity.RequestStatus;
import com.ioc.internship.repository.RentalRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentalExpirationJob {

    private final RentalRequestRepository rentalRequestRepository;

    @Scheduled(fixedRate = 600000) // 10 minutes
    @Transactional
    public void expireRentalRequests() {
        log.info("Running RentalExpirationJob...");
        List<RentalRequest> expiredRequests = rentalRequestRepository.findByStatusAndExpiredAtBefore(RequestStatus.PENDING, LocalDateTime.now());
        
        if (!expiredRequests.isEmpty()) {
            expiredRequests.forEach(request -> {
                request.setStatus(RequestStatus.EXPIRED);
                log.info("Marked RentalRequest ID {} as EXPIRED", request.getId());
            });
            rentalRequestRepository.saveAll(expiredRequests);
        }
        log.info("Finished RentalExpirationJob. Expired {} requests.", expiredRequests.size());
    }
}
