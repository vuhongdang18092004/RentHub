package com.ioc.internship.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AdminReviewAnalyticsResponse {
    private long totalReviews;
    private BigDecimal averageRating;
    private long fiveStar;
    private long fourStar;
    private long threeStar;
    private long twoStar;
    private long oneStar;
}
