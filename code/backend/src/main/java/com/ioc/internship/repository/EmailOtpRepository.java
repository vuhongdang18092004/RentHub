package com.ioc.internship.repository;

import com.ioc.internship.entity.EmailOtp;
import com.ioc.internship.entity.OtpPurpose;
import com.ioc.internship.entity.OtpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    Optional<EmailOtp> findFirstByEmailAndPurposeAndStatusOrderByCreatedAtDesc(String email, OtpPurpose purpose, OtpStatus status);

    @Query("SELECT COUNT(e) FROM EmailOtp e WHERE e.email = :email AND e.createdAt >= :timeLimit")
    int countByEmailAndCreatedAtAfter(@Param("email") String email, @Param("timeLimit") LocalDateTime timeLimit);
    
    void deleteByStatusInAndCreatedAtBefore(java.util.List<OtpStatus> statuses, LocalDateTime dateTime);
}
