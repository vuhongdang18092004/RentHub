package com.ioc.internship.service.ai;

import com.ioc.internship.entity.UserEntity;
import com.ioc.internship.service.ai.context.ProductContextProvider;
import com.ioc.internship.service.ai.context.RentalContextProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class AIToolExecutor {

    private final ProductContextProvider productContextProvider;
    private final RentalContextProvider rentalContextProvider;

    public List<AITool> getAvailableTools() {
        List<AITool> tools = new ArrayList<>();
        
        // Tool 1: Search products
        Map<String, Object> searchParams = new HashMap<>();
        searchParams.put("type", "OBJECT");
        Map<String, Object> props = new HashMap<>();
        Map<String, Object> queryProp = new HashMap<>();
        queryProp.put("type", "STRING");
        queryProp.put("description", "Từ khóa tìm kiếm sản phẩm");
        props.put("keyword", queryProp);
        searchParams.put("properties", props);
        searchParams.put("required", List.of("keyword"));

        tools.add(AITool.builder()
                .name("searchProductsTool")
                .description("Tìm kiếm sản phẩm trên RentHub theo từ khóa")
                .parameters(searchParams)
                .build());

        // Tool 2: Get user rentals
        Map<String, Object> rentalParams = new HashMap<>();
        rentalParams.put("type", "OBJECT");
        rentalParams.put("properties", new HashMap<>()); // no args needed

        tools.add(AITool.builder()
                .name("getMyRentalsTool")
                .description("Lấy danh sách các đơn thuê hiện tại của người dùng")
                .parameters(rentalParams)
                .build());

        return tools;
    }

    public String executeTool(AIToolCall toolCall, UserEntity currentUser) {
        String toolName = toolCall.getName();
        Map<String, Object> args = toolCall.getArguments() != null ? toolCall.getArguments() : new HashMap<>();

        try {
            switch (toolName) {
                case "searchProductsTool":
                    String keyword = args.containsKey("keyword") ? args.get("keyword").toString() : "";
                    return productContextProvider.searchProducts(keyword);
                case "getMyRentalsTool":
                    return rentalContextProvider.getMyRentalsContext(currentUser);
                default:
                    return "Tool không tồn tại.";
            }
        } catch (Exception e) {
            return "Lỗi khi chạy tool: " + e.getMessage();
        }
    }
}
