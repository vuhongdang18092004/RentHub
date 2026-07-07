package com.ioc.internship.repository;

import com.ioc.internship.entity.Report;
import com.ioc.internship.entity.ReportStatus;
import com.ioc.internship.entity.Rental;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT COUNT(r) FROM Report r WHERE r.rental = :rental AND r.status IN :statuses")
    long countByRentalAndStatusIn(@Param("rental") Rental rental, @Param("statuses") List<ReportStatus> statuses);

    Page<Report> findByReporterIdOrReportedUserId(Long reporterId, Long reportedUserId, Pageable pageable);

    List<Report> findByRentalAndStatusOrderByIdDesc(Rental rental, ReportStatus status);
}
