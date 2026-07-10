package com.ioc.internship.service.ai;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class FAQEngine {

    private static class FAQ {
        List<String> keywords;
        String answer;

        FAQ(List<String> keywords, String answer) {
            this.keywords = keywords;
            this.answer = answer;
        }
    }

    private final List<FAQ> faqs = Arrays.asList(
            new FAQ(Arrays.asList("cách thuê", "làm sao để thuê", "hướng dẫn thuê"), 
                    "Để thuê sản phẩm trên RentHub, bạn chỉ cần tìm sản phẩm ưng ý, chọn ngày thuê và ngày trả, sau đó bấm 'Yêu cầu thuê'. Chủ đồ sẽ duyệt yêu cầu của bạn."),
            new FAQ(Arrays.asList("thanh toán", "trả tiền", "phương thức thanh toán"), 
                    "Sau khi chủ đồ duyệt yêu cầu thuê, bạn có thể thanh toán qua các cổng thanh toán hỗ trợ trên RentHub như VNPAY hoặc thẻ ngân hàng."),
            new FAQ(Arrays.asList("hoàn tiền", "refund", "hủy đơn"), 
                    "Nếu bạn hủy đơn trước khi chủ đồ bàn giao, hệ thống sẽ tự động hoàn tiền lại vào tài khoản của bạn trong vòng 3-5 ngày làm việc."),
            new FAQ(Arrays.asList("khiếu nại", "report", "báo cáo"), 
                    "Bạn chỉ có thể tạo khiếu nại (Report) khi trạng thái đơn hàng là đang thuê (RECEIVED) hoặc đã trả (RETURNED). Quản trị viên sẽ xem xét và giải quyết tranh chấp."),
            new FAQ(Arrays.asList("đánh giá", "review"), 
                    "Bạn có thể đánh giá sản phẩm sau khi đơn thuê hoàn tất (COMPLETED). Mỗi đơn thuê bạn được quyền đánh giá 1 lần để giúp những người thuê sau có thêm thông tin."),
            new FAQ(Arrays.asList("thông báo", "notification"), 
                    "Hệ thống sẽ gửi thông báo (Notification) ngay trên quả chuông ở góc phải màn hình mỗi khi đơn thuê của bạn thay đổi trạng thái, hoặc khi có khiếu nại được giải quyết.")
    );

    /**
     * Checks if the user's input matches any FAQ.
     * Returns the answer if matched, or null if no match is found.
     */
    public String matchFAQ(String input) {
        String lowerInput = input.toLowerCase();
        for (FAQ faq : faqs) {
            for (String keyword : faq.keywords) {
                if (lowerInput.contains(keyword)) {
                    return faq.answer;
                }
            }
        }
        return null;
    }
}
