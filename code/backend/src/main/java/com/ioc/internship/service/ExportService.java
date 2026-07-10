package com.ioc.internship.service;

import com.ioc.internship.entity.Payment;
import com.ioc.internship.entity.Rental;
import com.ioc.internship.entity.Report;
import com.ioc.internship.entity.UserEntity;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.util.List;

@Service
public class ExportService {

    public void exportUsersToCsv(PrintWriter writer, List<UserEntity> users) {
        writer.println("ID,Username,Email,Role,Status,Created At");
        for (UserEntity user : users) {
            writer.printf("%d,%s,%s,%s,%s,%s\n",
                    user.getId(),
                    escapeCsv(user.getUsername()),
                    escapeCsv(user.getEmail()),
                    user.getRole(),
                    user.getStatus(),
                    user.getCreatedAt());
        }
    }

    public void exportPaymentsToCsv(PrintWriter writer, List<Payment> payments) {
        writer.println("ID,Transaction Code,Amount,Payment Type,Status,User ID,Rental ID,Created At");
        for (Payment p : payments) {
            writer.printf("%d,%s,%f,%s,%s,%d,%d,%s\n",
                    p.getId(),
                    escapeCsv(p.getTransactionCode()),
                    p.getAmount().doubleValue(),
                    p.getPaymentType(),
                    p.getStatus(),
                    p.getPayer().getId(),
                    p.getRental() != null ? p.getRental().getId() : null,
                    p.getCreatedAt());
        }
    }

    public void exportReportsToCsv(PrintWriter writer, List<Report> reports) {
        writer.println("ID,Reporter ID,Reported User ID,Rental ID,Reason,Status,Created At");
        for (Report r : reports) {
            writer.printf("%d,%d,%d,%d,%s,%s,%s\n",
                    r.getId(),
                    r.getReporter().getId(),
                    r.getReportedUser() != null ? r.getReportedUser().getId() : null,
                    r.getRental() != null ? r.getRental().getId() : null,
                    r.getReason(),
                    r.getStatus(),
                    r.getCreatedAt());
        }
    }

    public void exportRentalsToCsv(PrintWriter writer, List<Rental> rentals) {
        writer.println("ID,Product ID,Owner ID,Renter ID,Status,Start Date,End Date,Total Price,Created At");
        for (Rental r : rentals) {
            writer.printf("%d,%d,%d,%d,%s,%s,%s,%f,%s\n",
                    r.getId(),
                    r.getProduct().getId(),
                    r.getOwner().getId(),
                    r.getRenter().getId(),
                    r.getStatus(),
                    r.getStartDate(),
                    r.getEndDate(),
                    r.getTotalPrice().doubleValue(),
                    r.getCreatedAt());
        }
    }

    private String escapeCsv(String data) {
        if (data == null) return "";
        data = data.replace("\"", "\"\"");
        if (data.contains(",") || data.contains("\"") || data.contains("\n")) {
            data = "\"" + data + "\"";
        }
        return data;
    }
}
