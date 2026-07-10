package com.ioc.internship.controller.admin;

import com.ioc.internship.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList; // Mock list for now

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminExportController {

    private final ExportService exportService;

    @GetMapping("/users/export")
    public void exportUsers(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"users.csv\"");
        exportService.exportUsersToCsv(response.getWriter(), new ArrayList<>());
    }

    @GetMapping("/payments/export")
    public void exportPayments(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"payments.csv\"");
        exportService.exportPaymentsToCsv(response.getWriter(), new ArrayList<>());
    }

    @GetMapping("/reports/export")
    public void exportReports(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"reports.csv\"");
        exportService.exportReportsToCsv(response.getWriter(), new ArrayList<>());
    }

    @GetMapping("/rentals/export")
    public void exportRentals(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"rentals.csv\"");
        exportService.exportRentalsToCsv(response.getWriter(), new ArrayList<>());
    }
}
