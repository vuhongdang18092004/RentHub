package com.ioc.internship.repository;

import com.ioc.internship.entity.Payment;
import com.ioc.internship.entity.PaymentStatus;
import com.ioc.internship.entity.PaymentType;
import com.ioc.internship.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long>, JpaSpecificationExecutor<Payment> {
    
    boolean existsByTransactionCode(String transactionCode);
    
    long countByRentalAndPaymentTypeAndStatus(Rental rental, PaymentType paymentType, PaymentStatus status);

    boolean existsByRentalAndStatus(Rental rental, PaymentStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Payment p WHERE p.rental = :rental AND p.paymentType IN :types AND p.status = :status")
    boolean existsByRentalAndPaymentTypeInAndStatus(@org.springframework.data.repository.query.Param("rental") Rental rental, @org.springframework.data.repository.query.Param("types") java.util.List<PaymentType> types, @org.springframework.data.repository.query.Param("status") PaymentStatus status);

    org.springframework.data.domain.Page<Payment> findByRental(Rental rental, org.springframework.data.domain.Pageable pageable);

    java.util.List<Payment> findByRentalOrderByIdDesc(Rental rental);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS' AND p.paymentType != 'REFUND'")
    java.math.BigDecimal calculateTotalRevenue();
    @org.springframework.data.jpa.repository.Query("SELECT p.rental.renter.id, p.rental.renter.fullName, p.rental.renter.email, COUNT(p) FROM Payment p WHERE p.paymentType IN ('REFUND', 'REFUND_DEPOSIT', 'REFUND_CANCEL') GROUP BY p.rental.renter.id, p.rental.renter.fullName, p.rental.renter.email ORDER BY COUNT(p) DESC")
    java.util.List<Object[]> findTopRefundedRenters(org.springframework.data.domain.Pageable pageable);
}
