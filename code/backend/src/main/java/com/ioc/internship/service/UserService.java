package com.ioc.internship.service;

import com.ioc.internship.dto.request.UserStatusUpdateRequest;
import com.ioc.internship.dto.request.UserUpdateRequest;
import com.ioc.internship.dto.response.UserResponse;
import com.ioc.internship.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getMyProfile(String email);
    UserEntity getUserByEmail(String email);
    UserResponse updateMyProfile(String email, UserUpdateRequest request);
    Page<UserResponse> getAllUsersForAdmin(String keyword, String role, String status, Pageable pageable);
    UserResponse getUserDetailForAdmin(Long id);
    UserResponse updateUserStatusByAdmin(Long id, UserStatusUpdateRequest request, String adminEmail);
}
