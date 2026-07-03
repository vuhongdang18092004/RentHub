package com.ioc.internship.dto.response;

import com.ioc.internship.entity.UserEntity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicOwnerResponse {
    private Long id;
    private String fullName;
    private String avatarUrl;

    public static PublicOwnerResponse fromEntity(UserEntity user) {
        if (user == null) {
            return null;
        }
        return PublicOwnerResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
