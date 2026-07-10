package com.ioc.internship.service.ai.context;

import com.ioc.internship.dto.response.PublicProductDetailResponse;
import com.ioc.internship.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductContextProvider {

    private final ProductService productService;

    public String searchProducts(String keyword) {
        Page<com.ioc.internship.dto.response.PublicProductSummaryResponse> page = productService.getPublicProducts(
                0, 5, keyword, null, null, null, null, null, null, null, null
        );
        
        List<com.ioc.internship.dto.response.PublicProductSummaryResponse> products = page.getContent();
        if (products.isEmpty()) {
            return "Không tìm thấy sản phẩm nào phù hợp.";
        }
        
        return products.stream()
                .map(p -> String.format("ID: %d, Tên: %s, Giá/ngày: %s", p.getId(), p.getName(), p.getPricePerDay()))
                .collect(Collectors.joining("\n"));
    }
}
