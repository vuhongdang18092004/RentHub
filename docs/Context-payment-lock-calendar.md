# Context cho Antigravity — RentHub: Khoá lịch sau khi thanh toán + Thanh toán VietQR về tài khoản chủ đồ

## 0. AUDIT TRƯỚC KHI CODE

Đọc và xác nhận các điểm sau trước khi bắt đầu (đã audit sẵn, ghi lại để
không phải dò lại code):

1. **`Rental` đã có sẵn state machine** (`entity/RentalStatus.java`):
   `WAITING_PAYMENT → ACTIVE → RETURN_PENDING → COMPLETED / CANCELLED`.
   Rental được tạo ở `RentalRequestServiceImpl.approveRentalRequest()`
   (sau khi chủ đồ duyệt yêu cầu thuê), luôn khởi tạo `WAITING_PAYMENT`.
   **Không có bất kỳ endpoint nào chuyển `WAITING_PAYMENT → ACTIVE`.**
   Đây là lỗ hổng chính cần vá — hiện tại "đã thanh toán" chỉ được giả lập
   ở FE bằng `localStorage.getItem("renthub_paid_requests")`
   (`src/app/rentals/renter/page.tsx`), **không hề persist xuống backend**.
   Sau task này, khái niệm "đã thanh toán" phải là dữ liệu thật trong DB
   (`rentals.status = ACTIVE`), không dùng localStorage nữa.

2. **Chống trùng lịch đã có một phần ở backend**:
   `RentalRepository.existsConflictingRental(productId, start, end)` check
   các rental có status `WAITING_PAYMENT | ACTIVE | RETURN_PENDING` bị
   overlap ngày, và được gọi khi **chủ đồ duyệt yêu cầu** (approve). Tức là
   backend đã đảm bảo không thể có 2 rental active/waiting-payment chồng
   ngày cho cùng 1 sản phẩm. Việc còn thiếu là **hiển thị các ngày đã bị
   khoá này lên lịch phía FE** (`booking-widget.tsx`) để người thuê khác
   thấy bôi xám và không bấm chọn được — hiện tại lịch không fetch dữ liệu
   này, chỉ có UI tĩnh (phần "Đã đặt" trong legend không có logic thật).

3. **`UserEntity` chưa có field ngân hàng.** Cần thêm
   `bankAccountNumber`, `bankCode`, `bankAccountHolderName`.

4. **VietQR proxy (`src/app/api/vietqr/route.ts`) đang dùng tài khoản
   ngân hàng CỐ ĐỊNH của platform** (`process.env.BANK_ACCOUNT` /
   `BANK_CODE` / `BANK_OWNER`), không phải tài khoản của chủ đồ cho thuê.
   Phải sửa để route này nhận `bankAccount/bankCode/bankOwner` **động**
   trong request body (lấy từ hồ sơ chủ đồ), không dùng fallback env nữa
   cho luồng thuê thực tế. Cơ chế gọi VietQR (dùng `img.vietqr.io` để
   generate ảnh QR) **giữ nguyên** — đây chính là "cổng thanh toán" theo
   nghĩa: toàn bộ giao dịch phải đi qua flow checkout có kiểm soát của hệ
   thống (tạo QR, sinh mã đơn, xác nhận, cập nhật trạng thái trong DB),
   **không phải P2P thô** kiểu 2 bên tự nhắn tin trao đổi số tài khoản qua
   chat rồi hệ thống không biết gì. Số tiền vẫn chảy thẳng vào tài khoản
   ngân hàng thật của chủ đồ (đây là giới hạn tất yếu khi dùng VietQR
   Quick Link miễn phí — xem mục 5 "Giới hạn kỹ thuật" bên dưới), nhưng
   **toàn bộ vòng đời giao dịch (tạo đơn, hiển thị QR, xác nhận, khoá
   lịch) đều do backend RentHub quản lý**, không phải renter/owner tự xử
   lý ngoài hệ thống.

5. **Luồng thanh toán hiện tại**: renter gửi `RentalRequest` (PENDING) →
   owner duyệt (`approveRentalRequest`) → tạo `Rental` (`WAITING_PAYMENT`)
   → renter vào `/rentals/renter`, thấy nút "Thanh toán ngay" khi
   `status === APPROVED` → redirect `/checkout?requestId={id}`. Trang
   `/checkout` (mô tả ở `docs/Context-checkout.md`) hiện chỉ xử lý luồng
   giỏ hàng (tạo `RentalRequest` mới), **chưa xử lý nhánh `requestId`** để
   thanh toán cho một `Rental` đã được duyệt. Task này sẽ bổ sung nhánh đó.

6. **`PublicOwnerResponse`** (dùng để hiển thị công khai chủ đồ ở product
   detail, danh sách rental...) **không** và **sẽ không** chứa thông tin
   ngân hàng — thông tin ngân hàng là dữ liệu nhạy cảm, chỉ được trả về
   cho đúng người thuê của đúng rental đó, ở đúng bước thanh toán (xem
   mục 2.4).

---

## 1. LUỒNG NGHIỆP VỤ MỚI (tổng quan)

```
Renter gửi yêu cầu thuê (RentalRequest: PENDING)
        │
        ▼
Owner duyệt (approveRentalRequest)
        │   - check trùng lịch (existsConflictingRental) — ĐÃ CÓ
        ▼
Rental được tạo: status = WAITING_PAYMENT
   → Từ thời điểm này, lịch sản phẩm đã bị khoá cho khoảng ngày đó
     (mọi renter khác mở product detail sẽ thấy các ngày này bôi xám,
     không bấm chọn được) — MỚI, cần làm.
        │
        ▼
Renter vào /checkout?requestId=... → xem QR VietQR
   - Tài khoản nhận = tài khoản ngân hàng CỦA CHỦ ĐỒ (lấy từ hồ sơ owner)
   - Nội dung chuyển khoản = mã rental (vd "RH" + rentalId)
        │
        ▼
Renter tick "Tôi đã chuyển khoản" → gọi API xác nhận thanh toán
   POST /api/renter/rentals/{rentalId}/confirm-payment  — MỚI, cần làm
        │
        ▼
Backend chuyển Rental.status: WAITING_PAYMENT → ACTIVE
   → Lịch sản phẩm tiếp tục bị khoá (không phải chỉ khi WAITING_PAYMENT,
     mà cả khi ACTIVE) trong suốt [startDate, endDate] của rental đó.
```

Quy tắc khoá lịch: **một khoảng ngày bị coi là "không khả dụng" (bôi xám,
không cho bấm) nếu tồn tại `Rental` của sản phẩm đó có
`status IN (WAITING_PAYMENT, ACTIVE, RETURN_PENDING)` và khoảng ngày đó
giao với `[startDate, endDate]` của rental** — tái sử dụng đúng điều kiện
đang có trong `existsConflictingRental`, chỉ khác là lần này cần trả **danh
sách khoảng ngày** thay vì `boolean`, để FE vẽ lên lịch.

---

## 2. BACKEND (Spring Boot)

### 2.1 Migration DB — thêm cột ngân hàng vào bảng `users`

Tạo file mới `code/backend/src/main/resources/db/migration/V2__add_user_bank_info.sql`
(không sửa `V1`, Flyway không cho sửa migration đã chạy):

```sql
ALTER TABLE users
    ADD COLUMN bank_account_number VARCHAR(50),
    ADD COLUMN bank_code VARCHAR(20),
    ADD COLUMN bank_account_holder_name VARCHAR(255);
```

Không đặt `NOT NULL` — user cũ chưa nhập vẫn phải login/dùng app bình
thường được; chỉ bắt buộc nhập khi họ muốn **đăng sản phẩm cho thuê**
(ràng buộc ở tầng service, xem 2.3).

### 2.2 `UserEntity.java` — thêm field

```java
@Column(name = "bank_account_number")
private String bankAccountNumber;

@Column(name = "bank_code")
private String bankCode; // mã ngân hàng theo chuẩn Napas/VietQR, vd "VCB", "970436"

@Column(name = "bank_account_holder_name")
private String bankAccountHolderName;
```

### 2.3 DTO cập nhật hồ sơ cá nhân

**`UserUpdateRequest.java`** — thêm 3 field, validate mềm (optional, vì
không phải ai cũng cho thuê đồ):

```java
private String bankAccountNumber;
private String bankCode;
private String bankAccountHolderName;
```

Nếu muốn chặt hơn: thêm `@Pattern` cho `bankAccountNumber` (chỉ số,
6-30 ký tự).

**`UserResponse.java`** — thêm 3 field tương ứng, để user tự xem/sửa
thông tin của chính mình ở trang hồ sơ (`GET/PUT /api/users/profile`
đã có sẵn, không cần tạo endpoint mới — chỉ mở rộng response/request).

**`UserServiceImpl.updateMyProfile()`** — map thêm 3 field khi build lại
entity (xem pattern hiện tại đang map `fullName/phone/address/...`).

**QUAN TRỌNG**: `PublicOwnerResponse` và mọi response public khác
**KHÔNG** thêm 3 field này vào. Thông tin ngân hàng chỉ lộ ra qua đúng 1
kênh duy nhất: API xem chi tiết rental để thanh toán (mục 2.5).

### 2.4 Endpoint mới — lấy danh sách khoảng ngày đã bị khoá của 1 sản phẩm

Thêm vào `ProductController.java` (hoặc tạo route mới cùng chỗ, public,
không cần auth vì ai xem product detail cũng cần thấy lịch trống):

```java
@GetMapping("/{id}/blocked-dates")
public ResponseEntity<List<BlockedDateRangeResponse>> getBlockedDates(@PathVariable Long id) {
    return ResponseEntity.ok(productService.getBlockedDates(id));
}
```

DTO mới `dto/response/BlockedDateRangeResponse.java`:

```java
@Data
@Builder
public class BlockedDateRangeResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    // Không trả renterId/tên người thuê ở đây — chỉ cần biết "bận", tránh lộ thông tin người thuê khác
}
```

Thêm query vào `RentalRepository.java`:

```java
@Query("SELECT r FROM Rental r " +
       "WHERE r.product.id = :productId " +
       "AND r.status IN ('WAITING_PAYMENT', 'ACTIVE', 'RETURN_PENDING') " +
       "ORDER BY r.startDate ASC")
List<Rental> findBlockingRentalsByProductId(@Param("productId") Long productId);
```

`ProductService`/`ProductServiceImpl` thêm method `getBlockedDates(Long productId)`
map từ `List<Rental>` sang `List<BlockedDateRangeResponse>` (chỉ lấy
`startDate`/`endDate`).

### 2.5 Endpoint mới — xác nhận thanh toán cho 1 Rental

Tạo controller mới `controller/RenterRentalController.java` (đối xứng với
`OwnerRentalController` đã có):

```java
@RestController
@RequestMapping("/api/renter/rentals")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class RenterRentalController {

    private final RentalRequestService rentalRequestService; // hoặc tách RentalService riêng nếu muốn sạch hơn

    @GetMapping("/{id}/payment-info")
    public ResponseEntity<RentalPaymentInfoResponse> getPaymentInfo(
            @PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(
            rentalRequestService.getRentalPaymentInfo(authentication.getName(), id));
    }

    @PostMapping("/{id}/confirm-payment")
    public ResponseEntity<Void> confirmPayment(
            @PathVariable Long id, Authentication authentication) {
        rentalRequestService.confirmRentalPayment(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
```

DTO mới `dto/response/RentalPaymentInfoResponse.java` — đây là **kênh duy
nhất** trả thông tin ngân hàng của chủ đồ, và chỉ trả cho đúng renter của
đúng rental đó:

```java
@Data
@Builder
public class RentalPaymentInfoResponse {
    private Long rentalId;
    private BigDecimal totalPrice;
    private BigDecimal depositAmount;
    private String bankAccountNumber;   // của owner
    private String bankCode;            // của owner
    private String bankAccountHolderName; // của owner
    private String paymentContent;      // vd "RH" + rentalId, dùng làm nội dung CK
    private RentalStatus status;
}
```

Thêm 2 method vào `RentalRequestService` (interface) +
`RentalRequestServiceImpl` (implementation):

```java
@Override
public RentalPaymentInfoResponse getRentalPaymentInfo(String email, Long rentalId) {
    UserEntity renter = getUserByEmail(email);
    Rental rental = rentalRepository.findById(rentalId)
            .orElseThrow(() -> new RuntimeException("Rental not found"));

    if (!rental.getRenter().getId().equals(renter.getId())) {
        throw new RuntimeException("403 Forbidden: Not your rental");
    }
    if (!rental.getStatus().equals(RentalStatus.WAITING_PAYMENT)) {
        throw new RuntimeException("400 Bad Request: Rental is not waiting for payment");
    }

    UserEntity owner = rental.getOwner();
    if (owner.getBankAccountNumber() == null || owner.getBankCode() == null) {
        throw new RuntimeException("400 Bad Request: Chủ đồ chưa cập nhật tài khoản ngân hàng nhận tiền");
    }

    return RentalPaymentInfoResponse.builder()
            .rentalId(rental.getId())
            .totalPrice(rental.getTotalPrice())
            .depositAmount(rental.getDepositAmount())
            .bankAccountNumber(owner.getBankAccountNumber())
            .bankCode(owner.getBankCode())
            .bankAccountHolderName(owner.getBankAccountHolderName())
            .paymentContent("RH" + rental.getId())
            .status(rental.getStatus())
            .build();
}

@Override
@Transactional
public void confirmRentalPayment(String email, Long rentalId) {
    UserEntity renter = getUserByEmail(email);
    Rental rental = rentalRepository.findById(rentalId)
            .orElseThrow(() -> new RuntimeException("Rental not found"));

    if (!rental.getRenter().getId().equals(renter.getId())) {
        throw new RuntimeException("403 Forbidden: Not your rental");
    }
    if (!rental.getStatus().equals(RentalStatus.WAITING_PAYMENT)) {
        throw new RuntimeException("400 Bad Request: Rental is not waiting for payment");
    }

    rental.setStatus(RentalStatus.ACTIVE);
    rentalRepository.save(rental);

    // Lịch tự động bị khoá vì getBlockedDates() đã tính cả status ACTIVE (mục 2.4)
    // Không cần thao tác thêm gì trên Product — Product.status vẫn AVAILABLE
    // vì sản phẩm có thể còn cho thuê được ở các khoảng ngày khác.
}
```

> Ghi chú: đây vẫn là **xác nhận thủ công có kiểm soát** (renter tự bấm
> "tôi đã chuyển khoản" sau khi thấy QR), không phải webhook tự động đối
> soát ngân hàng thật — xem giới hạn kỹ thuật ở mục 5. Điểm khác biệt với
> P2P thông thường là: (1) hệ thống sinh QR/nội dung CK chuẩn hoá, (2)
> hệ thống ghi nhận trạng thái `ACTIVE` trong DB ngay khi xác nhận, (3)
> lịch bị khoá tự động dựa trên trạng thái đó — không phải 2 bên tự nhắn
> tin thoả thuận ngoài luồng.

### 2.6 Ràng buộc bổ sung

- Không cho `approveRentalRequest` chạy nếu owner chưa nhập bank info
  (fail sớm, tránh tạo `Rental` mà renter không thể thanh toán được):
  thêm check `owner.getBankAccountNumber() == null` → throw
  `"400 Bad Request: Vui lòng cập nhật tài khoản ngân hàng trước khi duyệt yêu cầu thuê"`.
- Không sửa logic `existsConflictingRental` hiện có (đang đúng).

---

## 3. FRONTEND (Next.js)

### 3.1 Trang hồ sơ cá nhân — `src/app/profile/page.tsx`

Thêm section mới "Tài khoản ngân hàng nhận tiền cho thuê":
- 3 input: **Ngân hàng** (dùng `Select` có sẵn ở `src/components/base/select`,
  danh sách ngân hàng lấy từ API công khai của VietQR
  `https://api.vietqr.io/v2/banks` — gọi 1 lần, cache ở client, lưu
  `code`/`bin` làm `bankCode`), **Số tài khoản**, **Tên chủ tài khoản**.
- Lưu qua `PUT /api/users/profile` đã có (chỉ mở rộng payload, dùng lại
  `userService.updateProfile` hiện tại, thêm 3 field).
- Ghi chú nhỏ dưới form (màu `text-tertiary`): "Đây là tài khoản sẽ nhận
  tiền khi có người thuê đồ của bạn. Vui lòng nhập chính xác."
- Không bắt buộc nhập ngay lúc đăng ký — chỉ nhắc khi user vào trang
  "Đăng sản phẩm cho thuê" (`/products/create`) mà chưa có bank info: hiện
  banner cảnh báo + link tới `/profile`.

### 3.2 Lịch trong `booking-widget.tsx` — bôi xám ngày đã bị khoá

- Thêm `useEffect` fetch `GET /api/products/{product.id}/blocked-dates`
  khi component mount, lưu vào state
  `blockedRanges: { startDate: string; endDate: string }[]`.
- Thêm hàm helper:
  ```typescript
  const isBlocked = (dayDate: Date) => {
    const d = formatDateToString(dayDate);
    return blockedRanges.some(r => d >= r.startDate && d <= r.endDate);
  };
  ```
- Trong `handleDayClick`: thêm điều kiện đầu tiên
  `if (isPast || isBlocked(dayDate)) return;`
- Trong render từng ngày: thêm biến `blocked = isBlocked(dayDate)`, disable
  nút (`disabled={isPast || blocked}`), style bôi xám riêng biệt với "past"
  để phân biệt trực quan (vd `bg-zinc-200 text-zinc-400 cursor-not-allowed line-through`
  thay vì chỉ nhạt màu như ngày quá khứ).
- Cập nhật legend: mục "Đã đặt" hiện đang chỉ là text tĩnh → gắn đúng màu
  đang dùng cho ô bị khoá.
- Nếu user cố chọn ngày đã khoá (trường hợp race condition — lịch fetch
  cũ), giữ nguyên validate ở backend (`createRentalRequest`/`approveRentalRequest`)
  làm lớp chặn cuối, FE chỉ là UX, không phải nguồn sự thật duy nhất.

### 3.3 Trang `/checkout` — nhánh thanh toán cho `Rental` đã duyệt (`?requestId=`)

Hiện `docs/Context-checkout.md` mới mô tả luồng giỏ hàng (tạo
`RentalRequest` mới). Bổ sung nhánh khi có query `requestId`:

1. Khi `/checkout?requestId={id}` được mở: gọi
   `GET /api/renter/requests/{id}` (đã có) để biết `status`. Nếu
   `status !== "APPROVED"`, redirect về `/rentals/renter` kèm toast lỗi.
2. Cần biết `rentalId` tương ứng với `requestId` đó để gọi
   `payment-info`/`confirm-payment`. **Bổ sung field `rentalId` vào
   `RentalRequestDetailResponse`** (BE, mục 2 — thêm `rentalId` lấy từ
   quan hệ `Rental.request`, cần thêm query
   `RentalRepository.findByRequestId(Long requestId)` để map ngược).
3. Gọi `GET /api/renter/rentals/{rentalId}/payment-info` → nhận
   `bankAccountNumber/bankCode/bankAccountHolderName/totalPrice/paymentContent`
   của **chủ đồ** (không phải platform).
4. Gọi `POST /api/vietqr` (route proxy nội bộ, xem 3.4) truyền
   `amount = totalPrice`, `content = paymentContent`,
   `bankAccount/bankCode/userBankName` lấy từ response bước 3 — **không**
   dùng giá trị mặc định từ env nữa cho nhánh này.
5. Ở bước 3 (Xác nhận) của checkout, thay vì gọi
   `rentalService.createRentalRequest(...)` như luồng giỏ hàng, nhánh
   `requestId` gọi:
   ```typescript
   await rentalService.confirmRentalPayment(rentalId);
   ```
   (thêm method mới trong `src/services/rental-service.ts`, POST tới
   `/api/renter/rentals/{rentalId}/confirm-payment`).
6. Sau khi thành công: toast "Thanh toán thành công! Đơn thuê đã được
   kích hoạt 🎉", redirect `/rentals/renter`.
7. **Xoá bỏ hoàn toàn cơ chế `localStorage.renthub_paid_requests`** ở
   `src/app/rentals/renter/page.tsx` — thay bằng đọc trực tiếp trạng thái
   thật: cần API trả về đủ thông tin để biết 1 `RentalRequest` đã
   `APPROVED` có `Rental` đi kèm đang ở `WAITING_PAYMENT` hay đã
   `ACTIVE`. Đơn giản nhất: thêm field `rentalStatus: RentalStatus | null`
   vào `RentalRequestSummaryResponse` (BE) — hiển thị badge dựa vào field
   này thay vì mảng `paidRequests` trong localStorage:
   - `rentalStatus == null` hoặc request `status !== APPROVED` → theo
     logic cũ (Chờ duyệt / Bị từ chối / Đã hủy).
   - `status === APPROVED && rentalStatus === "WAITING_PAYMENT"` → "Chờ
     thanh toán" + nút "Thanh toán ngay".
   - `rentalStatus === "ACTIVE"` (hoặc `RETURN_PENDING`/`COMPLETED`) →
     "Đã thanh toán", ẩn nút thanh toán.

### 3.4 `src/app/api/vietqr/route.ts` — nhận bank info động

```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, content, bankAccount, bankCode, userBankName } = body;

    if (!bankAccount || !bankCode) {
      return NextResponse.json(
        { error: "Thiếu thông tin tài khoản ngân hàng người nhận" },
        { status: 400 }
      );
    }

    const qrDataURL = `https://img.vietqr.io/image/${bankCode.toLowerCase()}-${bankAccount}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(userBankName || "")}`;

    return NextResponse.json({
      qrDataURL,
      bankInfo: { bankAccount, bankOwner: userBankName, bankCode: bankCode.toUpperCase() },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
```

Giữ route này **stateless** — không còn đọc `process.env.BANK_*` nữa cho
nhánh thuê thực tế (có thể giữ fallback env chỉ để dev/test QR khi chưa
có bank info thật, nhưng phải log rõ ràng đây là fallback).

---

## 4. RÀNG BUỘC CHUNG

- Không hardcode màu — dùng token từ `src/styles/theme.css`.
- Không đổi cấu trúc thư mục hiện có.
- Không lộ thông tin ngân hàng của owner qua bất kỳ API public/summary
  nào ngoài `GET /api/renter/rentals/{id}/payment-info` (chỉ renter sở
  hữu rental đó gọi được, chỉ khi `WAITING_PAYMENT`).
- Mọi thay đổi `RentalStatus` (`WAITING_PAYMENT → ACTIVE`) phải qua đúng
  1 method `confirmRentalPayment` (transactional), không set trực tiếp ở
  nơi khác.
- Giữ nguyên toàn bộ logic hiện có của `existsConflictingRental` và
  `approveRentalRequest` — chỉ thêm check "owner đã có bank info" (mục 2.6).

## 5. GIỚI HẠN KỸ THUẬT CẦN BIẾT (không phải bug, là đặc điểm của VietQR Quick Link)

`img.vietqr.io` là dịch vụ **tạo ảnh QR miễn phí**, không phải VietQR Pro
API có webhook đối soát giao dịch thật. Nghĩa là hệ thống **không thể tự
động biết** renter đã thực sự chuyển khoản hay chưa — bước
"xác nhận thanh toán" vẫn là renter tự khai báo (giống mọi app rent/marketplace
nhỏ dùng chuyển khoản QR ở VN). Điểm cải thiện so với hiện trạng là:
chuẩn hoá toàn bộ luồng qua backend (trạng thái thật trong DB, khoá lịch
tự động, không cần thao tác thủ công của admin) thay vì localStorage giả.

Nếu sau này muốn đối soát tự động thật (đúng nghĩa "cổng thanh toán"),
cần nâng cấp lên VietQR Pro / một PSP có webhook (Casso, SePay, PayOS...)
để nhận callback khi có giao dịch vào đúng tài khoản + đúng nội dung, rồi
tự động gọi `confirmRentalPayment`. Việc này **ngoài phạm vi task hiện
tại** — chỉ ghi chú lại để đội dự án biết đây là gap có chủ đích, không
phải thiếu sót.

---

## 6. KIỂM TRA TRƯỚC KHI BÁO XONG

1. Chạy migration `V2__add_user_bank_info.sql`, backend start thành công.
2. Vào `/profile`, nhập tài khoản ngân hàng, lưu thành công, load lại
   thấy đúng dữ liệu.
3. Với 1 sản phẩm đã có rental `WAITING_PAYMENT`/`ACTIVE`: mở product
   detail bằng tài khoản renter khác → các ngày trong khoảng đó bị bôi
   xám, bấm không chọn được.
4. Luồng đầy đủ: renter gửi yêu cầu → owner duyệt (owner phải có bank
   info, nếu chưa có thì duyệt bị chặn với thông báo rõ ràng) → renter
   vào `/rentals/renter`, thấy "Chờ thanh toán" → bấm "Thanh toán ngay" →
   `/checkout?requestId=...` → QR hiển thị đúng **tài khoản của owner**
   (không phải tài khoản platform cũ) → tick xác nhận → gọi
   `confirm-payment` → status chuyển `ACTIVE` → quay lại `/rentals/renter`
   thấy "Đã thanh toán" (đọc từ API, không phải localStorage).
5. Mở lại product detail sau bước 4: ngày thuê vẫn bị khoá (vì đang
   `ACTIVE`, không chỉ `WAITING_PAYMENT`).
6. Renter B thử tạo yêu cầu thuê trùng ngày với rental đang
   `WAITING_PAYMENT`/`ACTIVE` của renter A → bị chặn ở tầng approve
   (`existsConflictingRental`, logic cũ, không đổi).
7. `npm run lint` và `npm run build` ở frontend; build backend
   (`./gradlew build` hoặc tương đương) không lỗi.
