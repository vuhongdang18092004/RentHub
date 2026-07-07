package com.ioc.internship.dto.request;

import com.ioc.internship.entity.ReportReason;
import lombok.Data;

@Data
public class ReportCreateRequest {
    private Long rentalId;
    private ReportReason reason;
    private String description;
    private String evidenceImageUrl;
}
