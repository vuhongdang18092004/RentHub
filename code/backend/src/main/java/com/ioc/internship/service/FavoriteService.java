package com.ioc.internship.service;

import com.ioc.internship.dto.request.FavoriteRequest;
import com.ioc.internship.dto.response.FavoriteResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteService {
    void addFavorite(String email, FavoriteRequest request);
    Page<FavoriteResponse> getMyFavorites(String email, Pageable pageable);
    void removeFavorite(String email, Long productId);
}
