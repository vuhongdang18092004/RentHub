package com.ioc.internship.repository;

import com.ioc.internship.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {

    @Query("SELECT SUM(l.promptTokens) FROM AiUsageLog l")
    Long sumPromptTokens();

    @Query("SELECT SUM(l.completionTokens) FROM AiUsageLog l")
    Long sumCompletionTokens();

    @Query("SELECT SUM(l.estimatedCost) FROM AiUsageLog l")
    BigDecimal sumEstimatedCost();

    @Query("SELECT AVG(l.responseTimeMs) FROM AiUsageLog l")
    Double averageResponseTime();
}
