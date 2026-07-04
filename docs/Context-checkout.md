# Context cho Antigravity — RentHub: Trang Checkout 3 bước + VietQR

## 0. AUDIT TRƯỚC KHI CODE

Đọc và xác nhận 4 điểm sau trước khi bắt đầu:

1. `src/app/cart/page.tsx` — nút "Tiến hành đặt thuê" hiện chỉ gọi
   `triggerToast(...)`. Sẽ sửa thành `router.push("/checkout")`.
2. `src/context/cart-context.tsx` — `CartItem` chỉ có `rentDays: number`,
   chưa có `startDate`/`endDate`. Cần extend (xem Bước 1).
3. `src/app/api/vietmap/route.ts` — đây là pattern proxy API đúng của repo
   (Next.js Route Handler, dùng `fetch` server-side, trả `NextResponse`).
   Sẽ tạo proxy VietQR theo cùng pattern.
4. Backend `POST /api/renter/requests` nhận `{ productId, startDate, endDate,
   message }` (LocalDate dạng "YYYY-MM-DD"). Sẽ gọi sau khi user xác nhận
   đã chuyển khoản.

---

## BƯỚC 1 — Extend CartItem để lưu ngày thuê thật

### Sửa `src/context/cart-context.tsx`

Thêm 2 field optional vào `CartItem`:
```typescript
export interface CartItem {
  product: ProductSummary;
  quantity: number;
  rentDays: number;
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
}
```

Cập nhật signature của `addItem`:
```typescript
addItem: (product: ProductSummary, rentDays?: number,
          startDate?: string, endDate?: string) => void;
```

Cập nhật logic bên trong `addItem`:
- Nếu item đã có trong cart: update `rentDays`, `startDate`, `endDate`.
- Nếu chưa có: thêm mới với đầy đủ 4 field.

Thêm action mới `updateDates`:
```typescript
updateDates: (productId: number, startDate: string, endDate: string,
              rentDays: number) => void;
```

**Không đổi gì khác trong cart-context** — giữ nguyên `removeItem`,
`clearCart`, `isInCart`, `totalPrice`, `itemCount`.

---

## BƯỚC 2 — Next.js API Proxy cho VietQR

### Tạo `src/app/api/vietqr/route.ts`

Theo đúng pattern của `src/app/api/vietmap/route.ts` (Route Handler,
không dùng axios, dùng `fetch` thuần).

```typescript
// POST /api/vietqr
// Body: { amount, content, bankAccount, bankCode, userBankName }
// → gọi https://dev.vietqr.org/vqr/api/qr/generate-customer
// → trả về response JSON từ VietQR (bao gồm field qrDataURL hoặc tương đương)
```

Params cố định (đọc từ env, xem env vars bên dưới):
- `transType`: "C"
- `qrType`: 3

Params động (từ body request):
- `amount`: tổng tiền thanh toán (string)
- `content`: mã đơn hàng (ví dụ "RH" + timestamp 8 chữ số)
- `bankAccount`: số tài khoản ngân hàng nhận
- `bankCode`: mã ngân hàng
- `userBankName`: tên chủ tài khoản

Xử lý lỗi: nếu VietQR trả lỗi, forward status code và message về client.

### Thêm env vars vào `.env.local` (và `.env.example` nếu có)

```
BANK_ACCOUNT=1234567890
BANK_CODE=VCB
BANK_OWNER=CONG TY CP RENTHUB
```

Đọc trong route handler bằng `process.env.BANK_ACCOUNT` (không dùng
`NEXT_PUBLIC_` prefix vì đây là server-side handler, không expose ra client).

---

## BƯỚC 3 — Trang Checkout 3 bước

### Tạo `src/app/checkout/page.tsx`

Bọc trong `<ProtectedRoute>` (theo pattern `/cart/page.tsx`).
Redirect về `/cart` nếu giỏ hàng trống.

---

### Layout chung (áp dụng cho cả 3 bước)

**Header**: dùng `<Header />` hiện có.

**Breadcrumb**: `← | Giỏ hàng / Thanh toán` (nút ← quay về `/cart`).

**Step indicator** (3 bước, nằm giữa trang):
```
① Xem lại  ——  ② Thanh toán  ——  ③ Xác nhận
```
- Bước hiện tại: circle tím đặc + label đậm.
- Bước đã qua: circle tím có dấu ✓.
- Bước chưa đến: circle xám nhạt + label xám.
- Đường nối: line xám, đổi sang tím khi bước bên trái đã hoàn thành.
- Dùng token màu: `text-brand-600`, `bg-brand-600`, `border-brand-600`.

**Layout 2 cột** (theo ảnh):
- Cột trái (~60%): nội dung theo từng bước.
- Cột phải (~40%, sticky): "Tóm tắt đơn hàng" — hiển thị cố định suốt
  3 bước, không đổi, gồm:
  - List item: ảnh nhỏ, tên, ngày (nếu có), tổng tiền item.
  - Dòng phân cách.
  - "Tạm tính": tổng các item.
  - "Phí dịch vụ": 10% tạm tính (làm tròn).
  - "Vận chuyển": **Miễn phí** (màu xanh lá, text-success-primary).
  - "Tổng cộng": tạm tính + phí dịch vụ, font lớn đậm.
  - Badge nhỏ "🔒 Bảo vệ bởi RentHub Protect" màu tím nhạt.

---

### Bước 1 — Xem lại (`step === 1`)

**Panel "MÓN THUÊ · {số lượng}"**:

Mỗi item trong cart hiển thị:
- Ảnh thumbnail (40×40, bo tròn).
- Tên sản phẩm (truncate 1 dòng).
- Ngày thuê: nếu `startDate`/`endDate` đã có trong CartItem thì hiển thị
  dạng "22 Th2 · 25 Th2 · 3 ngày". Nếu chưa có, hiển thị
  DateRangePicker nhỏ để user chọn ngay tại đây (dùng
  `react-aria-components DateRangePicker`; ngày trong quá khứ disabled).
  Khi user chọn xong, gọi `updateDates(...)` để lưu vào cart context.
- Tên chủ sản phẩm: lấy từ `product` (nếu `ProductSummary` có field
  `ownerFullName` thì dùng, nếu không thì bỏ qua, không gọi API thêm).
- Giá: `pricePerDay × rentDays`, format `toLocaleString("vi-VN")` + "đ".
- Dòng nhỏ: `Xk/ngày × N ngày`.

**Panel "Địa chỉ giao hàng"**:

Hiển thị địa chỉ từ `user.address` (lấy từ `useAuth()`):
- Tab "Địa chỉ đã lưu" (active, filled brand) / "Địa chỉ mới" (outline).
- Tab "Địa chỉ đã lưu": hiển thị card địa chỉ từ profile user.
  - Label: "Nhà" + badge "MẶC ĐỊNH ✓".
  - Tên: `user.fullName`.
  - Địa chỉ: `user.address`.
  - SĐT: `user.phone`.
- Tab "Địa chỉ mới": text input đơn giản (dùng `Input` từ
  `src/components/base/input/input.tsx`) để nhập địa chỉ tạm. Lưu vào
  local state, không cần gọi API update profile.

**Nút điều hướng cuối trang** (chỉ trong cột trái):
- "Tiếp theo →" (primary, full width): validate tất cả item đã có
  `startDate`/`endDate` trước khi cho sang bước 2. Nếu có item nào
  chưa chọn ngày, highlight picker đó và toast cảnh báo.

---

### Bước 2 — Thanh toán (`step === 2`)

**Panel "GIAO ĐẾN"**:
- Hiển thị tóm tắt địa chỉ đã chọn ở bước 1.
- Link "Thay đổi" → quay về bước 1.

**Panel "PHƯƠNG THỨC THANH TOÁN"**:

Tabs: "Thẻ ngân hàng" | "Chuyển khoản" (mặc định active).

**Tab "Chuyển khoản" (active):**
- Gọi `POST /api/vietqr` (proxy nội bộ) khi tab này active, với:
  ```
  amount: tổng cộng (tạm tính + phí dịch vụ)
  content: mã đơn hàng tự sinh = "RH" + Date.now().toString().slice(-8)
  bankAccount: lấy từ response env (truyền qua API proxy, không expose client)
  bankCode: tương tự
  userBankName: tương tự
  ```
- Trong lúc chờ response: hiển thị skeleton placeholder hình vuông
  (~160×160) với `animate-pulse`.
- Sau khi có response: hiển thị ảnh QR từ field `qrDataURL` (hoặc field
  tương đương mà VietQR API thực tế trả về — kiểm tra response thật để
  dùng đúng field name).
- Countdown 15 phút (hiển thị MM:SS, đếm ngược từ 15:00). Khi hết giờ,
  hiển thị nút "Tạo lại mã QR" và gọi lại API.
- Dùng `motion` (đã có trong package.json) để animate QR fade-in.

**Tab "Thẻ ngân hàng":**
- Hiển thị placeholder "Tính năng đang phát triển" — không cần implement.

**Nút điều hướng:**
- "← Quay lại" (ghost): về bước 1.
- "Tiếp theo →" (primary): sang bước 3. Lưu `orderCode` (mã đơn đã tạo
  QR) vào local state để dùng ở bước 3.

---

### Bước 3 — Xác nhận (`step === 3`)

**Panel thông tin chuyển khoản thủ công** (hiển thị nếu user chọn tab
"Chuyển khoản"):

Mỗi dòng có icon copy (dùng `Copy01` hoặc tương đương từ
`@untitledui/icons`). Khi click: dùng `navigator.clipboard.writeText()`,
toast "Đã sao chép!".

| Label | Value |
|---|---|
| NGÂN HÀNG | Vietcombank (lấy từ env, hiển thị tên đầy đủ) |
| CHỦ TÀI KHOẢN | `process.env` / được truyền từ API proxy |
| SỐ TÀI KHOẢN | `process.env` / được truyền từ API proxy |
| SỐ TIỀN | tổng cộng format VND |
| NỘI DUNG CHUYỂN KHOẢN | `orderCode` đã tạo ở bước 2 |

**Lưu ý quan trọng** (box vàng nhạt border-warning):
> ⚠ Vui lòng chuyển **đúng số tiền** và ghi **đúng nội dung chuyển khoản**.

**Thêm env vars cần expose sang client** (thêm vào `.env.local`):
```
NEXT_PUBLIC_BANK_NAME_DISPLAY=Vietcombank
```
Chỉ expose tên ngân hàng để hiển thị. Số tài khoản và chủ TK được trả
về từ API proxy, không đặt `NEXT_PUBLIC_` cho các field nhạy cảm.

**Cơ chế trả thông tin ngân hàng về client**: API route `/api/vietqr`
ngoài việc gọi VietQR còn trả về `bankInfo` trong response:
```json
{
  "qrDataURL": "...",
  "bankInfo": {
    "bankAccount": "...",
    "bankOwner": "...",
    "bankCode": "..."
  }
}
```
Frontend lưu `bankInfo` vào state khi gọi API ở bước 2, dùng lại ở bước 3.

**Checkbox xác nhận:**
```
☐ Tôi đã chuyển khoản thành công với đúng số tiền và nội dung
   chuyển khoản như trên
```

**Nút "Tôi đã chuyển khoản"** (primary, full width, disabled khi
checkbox chưa tích):
- Khi nhấn: loading state trên nút.
- Gọi `POST /api/renter/requests` (backend) cho **từng item trong cart**,
  theo thứ tự tuần tự (không parallel để tránh race condition):
  ```typescript
  for (const item of items) {
    await rentalService.createRentalRequest({
      productId: item.product.id,
      startDate: item.startDate!,
      endDate: item.endDate!,
      message: `Đơn hàng ${orderCode}`,
    });
  }
  ```
- Nếu tất cả thành công: `clearCart()`, toast "Đặt thuê thành công! 🎉",
  redirect về `/`.
- Nếu có lỗi ở item nào: toast lỗi cụ thể, KHÔNG clearCart, để user retry.

**Nút "Quay lại"** (ghost, bên cạnh): về bước 2.

---

## BƯỚC 4 — Sửa nút trong Cart Page

### Sửa `src/app/cart/page.tsx`

```typescript
// Thêm import
import { useRouter } from "next/navigation";

// Trong component
const router = useRouter();

// Đổi onClick của nút "Tiến hành đặt thuê"
onClick={() => router.push("/checkout")}
```

Xóa `triggerToast(\"Tính năng đặt thuê đang được phát triển! 🚀\")`.

---

## RÀNG BUỘC

- Không hardcode màu — dùng token từ `src/styles/theme.css`.
- Không cài thêm thư viện UI — dùng component có sẵn trong
  `src/components/base/` (Button, Input, Checkbox...).
- Icon từ `@untitledui/icons` (Copy01, CheckCircle, AlertTriangle...).
- Giữ nguyên toàn bộ logic hiện có trong `cart-context.tsx` khi extend.
- API VietQR chỉ được gọi server-side qua Route Handler — không gọi
  trực tiếp từ client (tránh lộ cookie/credentials).
- `rentalService.createRentalRequest` đã được định nghĩa trong
  `src/services/rental-service.ts` (từ task trước). Nếu file này chưa tồn
  tại, tạo mới theo pattern của `product-service.ts`.

## KIỂM TRA TRƯỚC KHI BÁO XONG

1. Vào `/cart` → nhấn "Tiến hành đặt thuê" → vào `/checkout`.
2. Bước 1: thêm ngày cho item chưa có ngày, chọn địa chỉ → "Tiếp theo".
3. Bước 2: QR hiển thị (hoặc skeleton nếu VietQR env chưa config),
   countdown chạy → "Tiếp theo".
4. Bước 3: thông tin ngân hàng hiển thị, copy hoạt động, tích checkbox
   → "Tôi đã chuyển khoản" → tạo rental request → clear cart → redirect.
5. Chạy `npm run lint` và `npm run build`, báo kết quả.
