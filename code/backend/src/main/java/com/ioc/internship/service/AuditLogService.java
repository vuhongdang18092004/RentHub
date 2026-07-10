package com.ioc.internship.service;

import com.ioc.internship.entity.AuditLog;
import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.repository.AuditLogRepository;
import com.ioc.internship.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(Long adminId, String action, String entityType, Long entityId, String oldValue, String newValue) {
        try {
            UserEntity admin = userRepository.findById(adminId).orElse(null);
            if (admin == null) {
                log.warn("Cannot find admin with id: {} to save audit log", adminId);
                return;
            }

            AuditLog auditLog = AuditLog.builder()
                    .admin(admin)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .build();

            auditLogRepository.save(auditLog);
            log.info("Audit log saved: Action={}, EntityType={}, EntityId={}", action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    public Page<AuditLog> getAuditLogs(Long adminId, String action, String entityType, Long entityId, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable) {
        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (adminId != null) {
                predicates.add(cb.equal(root.get("admin").get("id"), adminId));
            }
            if (action != null && !action.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
            }
            if (entityType != null && !entityType.isEmpty()) {
                predicates.add(cb.equal(root.get("entityType"), entityType));
            }
            if (entityId != null) {
                predicates.add(cb.equal(root.get("entityId"), entityId));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable);
    }
}
