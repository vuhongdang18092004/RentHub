export interface ProductSummary {
  id: number;
  name: string;
  pricePerDay: number;
  status: "PENDING" | "AVAILABLE" | "RENTED" | "UNAVAILABLE" | "BLOCKED";
  category: {
    id: number;
    name: string;
    slug: string;
  };
  primaryImage: string | null;
  createdAt: string;
}

export interface LocalQA {
  keywords: string[];
  reply: string;
}

export const MOCK_PRODUCTS: ProductSummary[] = [
  {
    id: 1,
    name: "Máy ảnh Sony Alpha A7 III kèm ống kính 28-70mm f/3.5-5.6",
    pricePerDay: 350000,
    status: "AVAILABLE",
    category: { id: 1, name: "Điện tử", slug: "electronic" },
    primaryImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Xe đạp địa hình thể thao Giant ATX 2026",
    pricePerDay: 120000,
    status: "AVAILABLE",
    category: { id: 2, name: "Thể thao", slug: "sport" },
    primaryImage: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Lều dã ngoại chống nước 4 người Naturehike",
    pricePerDay: 80000,
    status: "AVAILABLE",
    category: { id: 3, name: "Dã ngoại", slug: "outdoor" },
    primaryImage: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: "Flycam DJI Mavic Air 2S Combo 3 pin chuyên nghiệp",
    pricePerDay: 500000,
    status: "AVAILABLE",
    category: { id: 1, name: "Điện tử", slug: "electronic" },
    primaryImage: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: "Loa Bluetooth di động JBL PartyBox 310 Bass Cực Mạnh",
    pricePerDay: 300000,
    status: "AVAILABLE",
    category: { id: 4, name: "Âm nhạc", slug: "music" },
    primaryImage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    name: "Bàn ghế cắm trại gấp gọn hợp kim nhôm (1 bàn 4 ghế)",
    pricePerDay: 70000,
    status: "AVAILABLE",
    category: { id: 3, name: "Dã ngoại", slug: "outdoor" },
    primaryImage: "https://images.unsplash.com/photo-1617103996765-27c170425a87?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    name: "Vợt cầu lông Yonex Astrox 88D Pro chính hãng",
    pricePerDay: 40000,
    status: "AVAILABLE",
    category: { id: 2, name: "Thể thao", slug: "sport" },
    primaryImage: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  }
];

export const LOCAL_QA: LocalQA[] = [
  {
    keywords: ["hello", "hi", "xin chào", "chào", "ai", "trợ lý"],
    reply: `Xin chào! Tôi là **Trợ lý thuê đồ thông minh RentHub AI** chạy trên đám mây Cloudflare. 

Tôi được train để giúp bạn **tìm kiếm đồ dùng cần thuê** trên RentHub và đưa ra các đề xuất sản phẩm phù hợp nhất. 

Hãy nhập nhu cầu của bạn, hoặc click chọn nhanh các chủ đề hot bên dưới:
[BUTTON:📷 Đi chụp ảnh du lịch|Tôi muốn thuê máy ảnh du lịch] [BUTTON:⛺ Đi cắm trại dã ngoại|Tôi muốn thuê đồ cắm trại] [BUTTON:🔊 Thuê loa nghe nhạc|Tôi muốn thuê loa kéo] [BUTTON:🚴 Xe đạp thể thao|Tôi muốn thuê xe đạp]`
  },
  {
    keywords: ["máy ảnh", "camera", "sony", "quay phim", "chụp hình"],
    reply: `Để quay phim, chụp hình chuyên nghiệp khi đi du lịch hoặc sự kiện, bạn nên tham khảo các dòng máy ảnh chất lượng cao sau trên RentHub:

1. **Máy ảnh Sony Alpha A7 III**: Dòng máy full-frame chụp thiếu sáng siêu tốt, lấy nét cực nhanh. [PRODUCT:1]
2. **Flycam DJI Mavic Air 2S**: Ghi lại những khung hình từ trên cao siêu đẹp, độ phân giải 4K sắc nét. [PRODUCT:4]

Bạn có cần xem thêm phụ kiện quay chụp đi kèm không?
[BUTTON:🚁 Xem thêm Flycam|Tôi muốn thuê flycam chụp từ trên cao] [BUTTON:🎤 Thuê Micro không dây|Tôi muốn thuê micro thu âm] [BUTTON:⚙️ Chân máy ảnh Tripod|Tôi muốn thuê tripod máy ảnh]`
  },
  {
    keywords: ["cắm trại", "dã ngoại", "lều", "bàn ghế", "outdoor", "camping"],
    reply: `Đi cắm trại dã ngoại cuối tuần là trải nghiệm tuyệt vời! Dưới đây là các đồ dùng cắm trại đang có sẵn để thuê trên RentHub:

1. **Lều dã ngoại chống nước Naturehike**: Đủ rộng cho nhóm 4 người, chống mưa gió tốt. [PRODUCT:3]
2. **Bộ bàn ghế cắm trại gấp gọn**: Tiện lợi khi ăn uống ngoài trời, gấp xếp nhanh chóng. [PRODUCT:6]

Bạn có thể đặt thuê các món đồ này ngay để chuẩn bị cho chuyến đi nhé!
[BUTTON:🪑 Thuê bộ bàn ghế xếp|Tôi muốn thuê bàn ghế xếp gọn] [BUTTON:🔦 Đèn pin cắm trại|Tôi muốn thuê đèn pin cắm trại] [BUTTON:🍳 Dụng cụ nấu ăn ngoài trời|Tôi muốn thuê bếp cắm trại dã ngoại]`
  },
  {
    keywords: ["xe đạp", "thể thao", "giant", "đạp xe", "đi phượt"],
    reply: `Nếu bạn cần phương tiện di chuyển tập thể dục hoặc đi phượt, đây là chiếc xe đạp thể thao rất được ưa chuộng trên RentHub:

- **Xe đạp địa hình thể thao Giant ATX**: Khung sườn hợp kim nhôm siêu nhẹ, phuộc nhún êm ái thích hợp mọi địa hình. [PRODUCT:2]

[BUTTON:🏸 Thuê Vợt cầu lông|Tôi muốn thuê vợt cầu lông] [BUTTON:👟 Giày thể thao leo núi|Tôi muốn thuê giày leo núi]`
  },
  {
    keywords: ["loa", "bluetooth", "âm thanh", "jbl", "nhạc", "party"],
    reply: `Để khuấy động bầu không khí buổi tiệc ngoài trời hoặc cắm trại, chiếc loa Bluetooth này là sự lựa chọn không thể bỏ qua:

- **Loa Bluetooth di động JBL PartyBox 310**: Âm bass siêu trầm cực mạnh, thời lượng pin trâu kèm đèn LED nhấp nháy theo nhạc. [PRODUCT:5]

[BUTTON:🎤 Thuê thêm Micro Karaoke|Tôi muốn thuê micro hát karaoke] [BUTTON:💡 Đèn LED nháy nhấp theo nhạc|Tôi muốn thuê đèn nháy sân khấu]`
  },
  {
    keywords: ["cầu lông", "vợt", "thể thao", "yonex"],
    reply: `Môn cầu lông giúp rèn luyện thể lực rất tốt. Trên RentHub có sẵn mẫu vợt cao cấp dành cho bạn:

- **Vợt cầu lông Yonex Astrox 88D Pro**: Dòng vợt thiên công mạnh mẽ, trợ lực đập cầu cực tốt. [PRODUCT:7]

[BUTTON:🚴 Thuê xe đạp Giant|Tôi muốn thuê xe đạp thể thao]`
  }
];

export const DEFAULT_AI_RESPONSE = `Chào bạn! Tôi là RentHub AI. 

Tôi có thể giúp bạn tìm kiếm mọi đồ dùng cho thuê từ điện tử, thể thao đến dã ngoại. Bạn đang cần thuê món đồ gì?
[BUTTON:📷 Đi du lịch chụp ảnh|Tôi muốn thuê máy ảnh du lịch] [BUTTON:⛺ Đi cắm trại ngoài trời|Tôi muốn thuê đồ cắm trại] [BUTTON:🔊 Thuê loa tiệc tùng|Tôi muốn thuê loa kéo]`;
