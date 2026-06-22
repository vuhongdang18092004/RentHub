package com.ioc.internship.repository;

import com.ioc.internship.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {

    Optional<VerificationToken> findByToken(String token);

    //  2 ANNOTATION : Để Spring JPA biết đây là lệnh thay đổi dữ liệu (DELETE) và thực thi nó trong một Transaction
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}