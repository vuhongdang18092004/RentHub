package com.ioc.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long rentalId;
    private Long productId;
    private UserSummaryResponse reviewer;
    private Integer rating;
    private String comment;
    private Boolean isHidden;
    private String hiddenReason;
    private Long hiddenBy;
    private LocalDateTime hiddenAt;
    private LocalDateTime createdAt;
}
