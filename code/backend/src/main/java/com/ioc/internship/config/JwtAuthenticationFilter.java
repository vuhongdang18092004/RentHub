package com.ioc.internship.config;

import com.ioc.internship.common.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        //Dùng getRequestURI() để quét toàn bộ URL, tránh bẫy chuỗi rỗng của Tomcat
        String requestUri = request.getRequestURI();
        if (requestUri.contains("/api/v1/auth") ||
                requestUri.contains("/swagger-ui") ||
                requestUri.contains("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 1. Lấy chuỗi mã hóa nằm trong trường "Authorization" từ Header
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // Nếu Header trống hoặc không bắt đầu bằng chữ "Bearer ", cho Request đi tiếp
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Cắt bỏ chữ "Bearer " để lấy chính xác chuỗi JWT Token
        jwt = authHeader.substring(7);

        // 3. Sử dụng JwtUtils để bóc tách lấy Email
        userEmail = jwtUtils.extractEmail(jwt);

        // 4. Nếu bóc được Email VÀ người dùng này CHƯA được xác thực trong phiên này
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Xuống DB tìm thông tin đầy đủ của User
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // Kiểm tra xem Token có chính chủ và còn hạn sử dụng hay không
            if (jwtUtils.isTokenValid(jwt, userDetails)) {

                // Tạo một chiếc "Thẻ thông hành"
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                // Đóng dấu chi tiết Request
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // CẤT CHIẾC THẺ NÀY VÀO KÉT SẮT BẢO MẬT
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Mở cửa cho Request tiếp tục hành trình
        filterChain.doFilter(request, response);
    }
}