# Context cho Antigravity — RentHub: Booking Calendar + Chat UI + Filter Sidebar

Đây là task lớn gồm 3 tính năng độc lập. Triển khai tuần tự theo thứ tự
ưu tiên dưới đây, báo kết quả từng phần trước khi sang phần tiếp theo.

---

## 0. AUDIT NHANH — ĐỌC TRƯỚC KHI CODE

Trước khi bắt đầu, hãy xác nhận 3 điểm sau:

1. Endpoint `GET /api/products/public` trong `ProductController.java` không
   có `@PreAuthorize` → không cần JWT, dùng được khi chưa đăng nhập.
2. Method `getPublicProductDetail` trong `src/services/product-service.ts`
   hiện đang gọi `/products/${id}` (endpoint cần JWT) thay vì
   `/products/public/${id}` (public endpoint). **Sửa lại URL này trước.**
3. `Slider` component tại `src/components/base/slider/slider.tsx` đang là
   TODO placeholder. **Cần implement thật** để dùng cho filter giá.

---

## PHẦN 1 — BOOKING CALENDAR trên trang chi tiết sản phẩm

### Mục tiêu
Trang `/products/[id]` hiện chỉ có nút "Thêm vào giỏ". Cần thêm khối đặt
lịch thuê bên phải như ảnh đính kèm (Shario reference): calendar chọn
ngày nhận/trả, số lượng, nút "Đặt ngay".

### API đã có — KHÔNG cần sửa backend

```
POST /api/renter/requests          (cần JWT)
Body: CreateRentalRequest {
  productId: Long,
  startDate: LocalDate,   // "YYYY-MM-DD"
  endDate:   LocalDate,
  message?:  String
}
Response: RentalRequestDetailResponse
```

### Yêu cầu UI (theo ảnh Shario)

**Layout trang `/products/[id]`:**
- Cột trái (~60%): ảnh gallery + breadcrumb + tên + rating + giá +
  thông tin chủ + mô tả + tính năng + đánh giá + "Món tương tự".
- Cột phải (~40%, sticky top): khối booking card gồm:
  1. **DateRangePicker** — calendar hiển thị 2 tháng liên tiếp (tháng
     hiện tại và tháng sau), cho phép chọn ngày bắt đầu và kết thúc.
     - Dùng `InputDate` từ `src/components/base/input/input-date.tsx`
       hoặc build calendar thuần dùng `react-aria-components` (DateRangePicker
       từ react-aria đã có sẵn trong package.json).
     - Các ngày trong quá khứ phải disabled.
     - Legend: Đã chọn (•), Trong khoảng, Đã đặt (✓), Trống.
  2. **Số lượng**: stepper tăng/giảm (−/+ button), min = 1, max = số
     lượng tồn kho (lấy từ product detail, field `quantity` nếu có, nếu
     không có thì default = 1 và ẩn stepper).
  3. **Tóm tắt giá**: hiển thị
     `pricePerDay × số ngày = tổng tiền` khi đã chọn đủ 2 ngày.
  4. **Nút "Đặt ngay"** (primary, full width):
     - Nếu chưa đăng nhập → redirect `/login` sau khi toast.
     - Nếu là chủ sản phẩm → ẩn nút, hiển thị "Đây là sản phẩm của bạn".
     - Nếu `product.status !== 'AVAILABLE'` → disable + label tương ứng.
     - Khi nhấn: gọi `POST /api/renter/requests`, loading state trên nút,
       sau khi thành công toast "Đã gửi yêu cầu thuê!" và clear form.
  5. **Nút "Nhắn tin"** (secondary outline, bên cạnh "Đặt ngay"):
     - Khi nhấn: gọi `POST /api/chat/conversations { recipientId: product.owner.id }`,
       sau đó mở Chat Drawer (xem Phần 2), cuộn đến conversation vừa tạo.
     - Nếu chưa đăng nhập → redirect `/login`.

### Service cần thêm vào `src/services/`

Tạo `src/services/rental-service.ts`:
```typescript
// POST /api/renter/requests
createRentalRequest(data: {
  productId: number;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;
  message?: string;
}): Promise<RentalRequestDetailResponse>
```

### Type cần thêm vào `src/types/backend.ts`

```typescript
export interface RentalRequestDetailResponse {
  id: number;
  productId: number;
  productName: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  message?: string;
  createdAt: string;
}
```

---

## PHẦN 2 — CHAT UI

### Mục tiêu
Tạo giao diện chat trong app để người thuê liên hệ với chủ sản phẩm.
Chat mở dạng **slide-in drawer từ phải** (không tạo route riêng), điều
khiển qua context/state toàn cục, giữ nguyên trang hiện tại phía sau.

### API đã có — KHÔNG cần sửa backend

```
POST /api/chat/conversations               { recipientId: Long }
  → ConversationSummaryResponse { conversationId, otherUser, lastMessage,
                                  lastMessageType, lastMessageTime, unreadCount }

GET  /api/chat/conversations               → ConversationSummaryResponse[]

GET  /api/chat/conversations/{id}/messages?page=0&size=20
  → Page<MessageResponse { id, conversationId, sender, messageType,
                           content, referencedProduct, isRead, createdAt }>

POST /api/chat/messages                    { conversationId, content,
                                             messageType: "TEXT"|"PRODUCT"|"IMAGE",
                                             referencedProductId? }
  → MessageResponse

PUT  /api/chat/conversations/{id}/read
DELETE /api/chat/conversations/{id}        (ẩn conversation)
```

### Service cần tạo: `src/services/chat-service.ts`

Map đủ 6 endpoint trên vào axios (theo pattern của `product-service.ts`,
dùng `api` từ `src/lib/axios`). Khai báo đủ TypeScript types inline hoặc
trong `src/types/backend.ts`.

### Context cần tạo: `src/context/chat-context.tsx`

Theo pattern của `cart-context.tsx`. Expose:
```typescript
interface ChatContextType {
  isOpen: boolean;
  activeConversationId: number | null;
  conversations: ConversationSummaryResponse[];
  openChat: (recipientId?: number) => Promise<void>;
  // openChat: nếu truyền recipientId, tự động tạo/lấy conversation
  // với người đó và chọn nó làm active
  closeChat: () => void;
  selectConversation: (id: number) => void;
  sendMessage: (content: string, type?: MessageType) => Promise<void>;
  messages: MessageResponse[];
  loadingMessages: boolean;
  unreadTotal: number; // tổng unread của tất cả conversations
  refreshConversations: () => Promise<void>;
}
```

### UI Drawer Component: `src/components/features/chat/chat-drawer.tsx`

Layout 2 cột bên trong drawer (width ~700px, full height màn hình):

**Cột trái — Danh sách conversations** (~240px):
- Header: "Tin nhắn" + nút đóng (X).
- Search input lọc theo tên người dùng (filter phía client, không gọi API).
- List conversation: avatar, tên, lastMessage preview (truncate 1 dòng),
  thời gian tương đối (vd "2 phút trước"), badge unread đỏ.
- Conversation đang active highlight bằng `bg-brand-50`.

**Cột phải — Khung chat** (còn lại):
- Header: avatar + tên người đang chat + nút "Xem hồ sơ" (link sang
  profile họ nếu có, bỏ qua nếu chưa có route).
- Vùng messages (scroll, flex-col, tin nhắn của mình bên phải, của đối
  phương bên trái). Bubble màu:
  - Tin mình: `bg-brand-600 text-white`.
  - Tin đối phương: `bg-neutral-100 text-text-primary`.
  - Nếu `messageType === 'PRODUCT'`: hiển thị card nhỏ embed (ảnh + tên
    + giá) của `referencedProduct` kèm link sang `/products/{id}`.
- Input area dưới: text input full width + nút gửi (icon Send từ
  `@untitledui/icons`). Enter gửi, Shift+Enter xuống dòng.
- Khi mở conversation, gọi `markAsRead` để reset unread.
- Phân trang messages: khi scroll lên đầu load thêm trang cũ
  (`page+1`), append lên trên.

**Hiển thị Drawer**: render trong layout gốc `src/app/layout.tsx`
(bên ngoài `{children}`) để nó overlay toàn app. Thêm backdrop mờ
khi drawer mở. Dùng `motion` (đã có trong `package.json`) để animate
slide-in từ phải.

**Icon chat trên Header** (`src/components/layout/header.tsx`):
- Thêm icon MessageCircle (hoặc tương đương từ `@untitledui/icons`) cạnh
  icon giỏ hàng, hiển thị badge số `unreadTotal` nếu > 0.
- Nhấn icon này gọi `openChat()` (không có recipientId → mở drawer với
  conversation đầu tiên hoặc trống nếu chưa có).
- Chỉ hiển thị icon này khi user đã đăng nhập.

---

## PHẦN 3 — FILTER SIDEBAR trên trang Khám phá / listing

### Mục tiêu
Trang khám phá / search results (kiểm tra xem đang ở route nào — có thể
là `/explore`, `/products`, hoặc kết quả từ header search) cần có sidebar
lọc bên trái như ảnh Shario đính kèm.

### API đã có — KHÔNG cần sửa backend

```
GET /api/products/public   (KHÔNG cần JWT)
Params: page, size, keyword, categoryId, minPrice, maxPrice, address, sort
→ Page<PublicProductSummaryResponse {
    id, name, pricePerDay, depositAmount, address,
    categoryName, ownerFullName, primaryImageUrl, status, createdAt
  }>

GET /api/categories   (nếu chưa có trong CategoryController, kiểm tra trước)
→ List<CategoryResponse { id, name, description }>
```

### Sửa `src/services/product-service.ts`

Thêm method dùng public endpoint (không cần JWT):

```typescript
// Dùng axios instance không gắn Authorization header (hoặc thêm
// interceptor skip nếu không có token)
getPublicProducts(params: {
  page?: number;
  size?: number;
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'relevant';
}): Promise<{ content: PublicProductSummaryResponse[]; totalElements: number; totalPages: number }>
```

### Implement `Slider` component (`src/components/base/slider/slider.tsx`)

Dùng `react-aria-components` — `Slider` component đã có trong package.
Implement đúng props đã khai báo (`value`, `onChange`, `min`, `max`,
`step`, `isDisabled`). Hỗ trợ cả single value và range (array 2 phần tử).
Dùng token màu `--color-brand-600` cho track đã chọn, không hardcode.

### Component Filter Sidebar: `src/components/features/products/filter-sidebar.tsx`

```typescript
interface FilterSidebarProps {
  categories: CategoryResponse[];
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

interface ProductFilters {
  categoryIds: number[];    // multi-select checkbox
  priceRange: [number, number]; // [min, max], default [0, 5_000_000]
  minRating?: number;       // 1–5 star (tùy ý, dùng radio)
  sort: 'newest' | 'price_asc' | 'price_desc' | 'relevant';
}
```

UI sidebar (theo ảnh Shario):
- Header "Phân loại": danh sách checkbox từng category, mỗi dòng gồm
  `Checkbox` (từ `src/components/base/checkbox/`) + tên + số lượng sản
  phẩm (nếu API trả về, nếu không có thì bỏ số lượng).
  - "Tất cả các loại" là option đầu, khi tích vào thì bỏ tất cả category
    filter (categoryIds = []).
- Header "Giá mỗi ngày": `Slider` range (vừa implement), hiển thị
  giá trị min/max dạng `50K` / `5M`, có preset buttons (200K, 500K, 1M,
  2M, 5M) bên dưới để chọn nhanh max.
- Header "Đánh giá": radio buttons (Tùy ý / 3+ / 4+ / 4.5+).
- Mỗi section có thể collapse (accordion), default open.
- Nút "Xóa bộ lọc" ở footer sidebar.

### Trang listing / khám phá

Kiểm tra route hiện tại để sản phẩm public đang hiển thị ở đâu. Nếu
chưa có trang listing riêng, tạo `src/app/explore/page.tsx`.

Layout trang (theo ảnh Shario):
- Header sticky dùng `<Header />` hiện có.
- Body: 2 cột — `FilterSidebar` cố định bên trái (~280px, sticky) +
  vùng kết quả bên phải.
- Vùng kết quả:
  - Dòng trên: "X món đồ" bên trái + dropdown sort bên phải (dùng
    `Select` hoặc `Dropdown` từ `src/components/base/`).
  - Grid sản phẩm: 4 cột trên desktop, 2 cột trên tablet, 1 cột mobile.
  - Mỗi card: ảnh (aspect 4/3, bo góc `radius-xl`), badge giá góc trái
    ảnh, icon heart (toggle wishlist), tên, rating sao + địa điểm, giá.
  - Khi bấm card → navigate sang `/products/${id}`.
  - Infinite scroll hoặc pagination đơn giản ở cuối.
- Filter thay đổi → gọi lại API với params mới, reset về page 0.
- Hiển thị skeleton loading (4–8 card placeholder) khi đang tải.

**Nối với search header**: khi người dùng submit search từ Header
(thanh tìm kiếm 3 field: vị trí, thời gian, từ khóa), navigate sang
`/explore?keyword=...&address=...` và trang explore đọc query params để
pre-fill filter + gọi API ngay.

**Nối với chip category trên Home**: khi bấm chip category (Điện tử,
Thể thao...) trên trang chủ, navigate sang `/explore?categoryId=...`.

---

## RÀNG BUỘC CHUNG (áp dụng cho cả 3 phần)

- Tuân theo `AGENTS.md` / `CLAUDE.md` trong repo: không hardcode màu,
  dùng design token từ `src/styles/theme.css`, không tạo variant ngoài
  docs, ưu tiên component có sẵn trong `src/components/base/`.
- Icon: chỉ dùng `@untitledui/icons` (đã cài sẵn), không cài thêm icon
  set khác.
- Không sửa `code/backend` — tất cả endpoint cần thiết đã tồn tại.
- Không sửa `src/context/AuthContext.tsx`, `src/context/cart-context.tsx`,
  `src/context/wishlist-context.tsx` — chỉ sử dụng các hook export của chúng.
- Khi cần type mới, thêm vào `src/types/backend.ts` hoặc khai báo cục bộ
  trong service file, không tự đặt type trùng với những gì đã có.
- Không phá vỡ route đang hoạt động (login, register, cart, profile,
  admin, products/my, products/create, products/favorites).

## THỨ TỰ GIAO HÀNG

1. Sửa bug `getPublicProductDetail` URL (30 giây, làm ngay).
2. Implement `Slider` component (cần cho cả filter lẫn stepper).
3. Tạo `rental-service.ts` + type.
4. Cập nhật UI trang `/products/[id]` — booking calendar + nút Đặt ngay.
5. Tạo `chat-service.ts` + `chat-context.tsx` + `chat-drawer.tsx` + nối
   header.
6. Implement Filter Sidebar + trang `/explore`.

Sau mỗi bước, chạy `npm run dev` + browser subagent chụp screenshot để
tôi review. Sau khi xong toàn bộ, chạy `npm run lint` và `npm run build`,
báo kết quả.
