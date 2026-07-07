package com.ioc.internship.repository;

import com.ioc.internship.entity.Payment;
import com.ioc.internship.entity.PaymentStatus;
import com.ioc.internship.entity.PaymentType;
import com.ioc.internship.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    boolean existsByTransactionCode(String transactionCode);
    
    long countByRentalAndPaymentTypeAndStatus(Rental rental, PaymentType paymentType, PaymentStatus status);

    boolean existsByRentalAndStatus(Rental rental, PaymentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Payment p WHERE p.rental = :rental AND p.paymentType IN :types AND p.status = :status")
    boolean existsByRentalAndPaymentTypeInAndStatus(@org.springframework.data.repository.query.Param("rental") Rental rental, @org.springframework.data.repository.query.Param("types") java.util.List<PaymentType> types, @org.springframework.data.repository.query.Param("status") PaymentStatus status);

    org.springframework.data.domain.Page<Payment> findByRental(Rental rental, org.springframework.data.domain.Pageable pageable);
}
