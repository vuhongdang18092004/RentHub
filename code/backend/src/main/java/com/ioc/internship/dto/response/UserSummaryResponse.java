package com.ioc.internship.dto.response;

import com.ioc.internship.entity.UserEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;

    public static UserSummaryResponse fromEntity(UserEntity user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
