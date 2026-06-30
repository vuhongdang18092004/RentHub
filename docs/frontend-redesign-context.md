# Frontend Redesign Context
## Project: RentHub / Shario

---

# Mục tiêu

Tái cấu trúc toàn bộ Frontend hiện tại để phù hợp với mô hình Marketplace cho thuê đồ dùng.

Frontend hiện tại đang hoạt động theo mô hình:

Login
↓
Dashboard

Tôi không muốn luồng này nữa.

Frontend mới phải hoạt động theo mô hình:

Home Page
↓
Khám phá sản phẩm
↓
Xem chi tiết sản phẩm

Nếu chưa đăng nhập:
→ Login/Register

Nếu đã đăng nhập:
→ Thực hiện các hành động liên quan

---

# Tầm nhìn sản phẩm

Shario là nền tảng kết nối những người có nhu cầu thuê và cho thuê đồ dùng.

Người dùng phải có thể:

- Khám phá sản phẩm ngay khi truy cập website.
- Tìm kiếm sản phẩm theo nhu cầu.
- Xem chi tiết sản phẩm.
- Chỉ cần đăng nhập khi muốn thực hiện hành động yêu cầu xác thực.

Website không được mang cảm giác của một Dashboard quản trị.

Website phải mang cảm giác của:

- Airbnb
- Facebook Marketplace
- Chợ Tốt
- Sharetribe

---

# Landing Page

## Route

/
(Home Page)

Đây là trang đầu tiên khi mở website.

Không được redirect tới:

- /dashboard
- /login

---

# Header

## Thành phần

Logo

Thanh tìm kiếm:

- Vị trí
- Thời gian
- Từ khóa

Navigation:

- Khám phá
- Cho thuê

Avatar User/Admin

---

# Hero Section

Nội dung:

Shario

Thuê Đồ Gần Bạn

Thuê đồ từ người xung quanh bạn.
Nhanh chóng – tiện lợi – đúng lúc.

Có:

- Search Box lớn
- CTA khám phá sản phẩm

---

# Category Slider

Hiển thị ngang:

- Điện tử
- Thể thao
- Dã ngoại
- Âm nhạc
- Phương tiện
- Gia dụng
- Khác

---

# Product Discovery Section

Hiển thị dạng Card Grid.

Mỗi card gồm:

- Hình ảnh
- Tên sản phẩm
- Giá thuê/ngày
- Địa chỉ
- Chủ sở hữu

---

# Authentication Flow

## Guest

Người dùng chưa đăng nhập.

Được phép:

- Trang chủ
- Tìm kiếm
- Danh mục
- Danh sách sản phẩm
- Chi tiết sản phẩm

Không được phép:

- Đăng sản phẩm
- Thuê sản phẩm
- Kho đồ của tôi
- Hồ sơ cá nhân
- Chức năng quản trị

---

# Login Required Actions

Nếu Guest bấm:

- Thuê ngay
- Đặt thuê
- Liên hệ chủ đồ
- Đăng sản phẩm
- Kho đồ của tôi
- Hồ sơ cá nhân

Thì:

Redirect → /login

---

# Role System

Backend hiện hỗ trợ:

- ROLE_USER
- ROLE_ADMIN

Frontend phải phân quyền theo Role.

---

# ROLE_USER Experience

Sau khi đăng nhập thành công:

Redirect:

/

(Home Page)

Không chuyển tới Dashboard.

---

## User Dropdown Menu

Khi click Avatar User:

Hiển thị:

- Hồ sơ cá nhân
- Kho đồ của tôi
- Đăng sản phẩm
- Đăng xuất

---

## User Routes

/
Home

/profile
Hồ sơ cá nhân

/products/my
Kho đồ của tôi

/products/create
Đăng sản phẩm

/products/[id]
Chi tiết sản phẩm

/products/[id]/edit
Chỉnh sửa sản phẩm

---

# ROLE_ADMIN Experience

Admin không tham gia hoạt động cho thuê.

Admin là người quản trị hệ thống.

---

## Admin Login Success

Redirect:

/admin/users

---

## Admin Dropdown Menu

Khi click Avatar Admin:

Hiển thị:

- Hồ sơ cá nhân
- Quản lý người dùng
- Quản lý danh mục
- Đăng xuất

---

## Admin Routes

/profile

/admin/users

/admin/categories

---

## Admin Restrictions

Admin không nhìn thấy:

- Kho đồ của tôi
- Đăng sản phẩm
- Chỉnh sửa sản phẩm

Admin không được truy cập:

- /products/my
- /products/create
- /products/[id]/edit

Nếu truy cập:

Redirect → /admin/users

---

# Route Guards

## PublicRoute

Nếu đã đăng nhập:

ROLE_USER
→ /

ROLE_ADMIN
→ /admin/users

---

## ProtectedRoute

Nếu không có token:

→ /login

---

## AdminRoute

ROLE_ADMIN:
Cho phép truy cập.

ROLE_USER:
→ /

Guest:
→ /login

---

# Layout Strategy

Không sử dụng Dashboard Layout làm giao diện chính.

Website phải sử dụng:

Marketplace Layout

bao gồm:

- Header
- Hero
- Category Navigation
- Product Discovery
- Footer

Dashboard chỉ là khu vực phụ trợ.

---

# UI/UX Direction

Phong cách:

- Hiện đại
- Sạch
- Cao cấp
- Marketplace

Lấy cảm hứng từ:

- Airbnb
- Sharetribe
- Facebook Marketplace

---

# Design Requirements

Ưu tiên:

- White Space lớn
- Typography rõ ràng
- Border Radius lớn
- Card hiện đại
- Hover Effects nhẹ
- Responsive

Không sử dụng:

- Giao diện quản trị cũ kỹ
- Sidebar cố định cho người dùng thông thường

---

# Refactor Requirements

Cho phép:

- Refactor Routing
- Refactor Layout
- Refactor Navigation
- Refactor Menu
- Refactor Authentication Flow phía Frontend

Không được:

- Thay đổi Backend API
- Thay đổi JWT
- Thay đổi Role Logic
- Thay đổi API Contract

---

# Required Analysis Before Coding

Trước khi bắt đầu code phải xuất:

1. Sitemap
2. User Flow
3. Route Tree
4. Component Tree
5. Layout Tree
6. Refactor Plan

Chỉ bắt đầu code sau khi kế hoạch được xác nhận.

---

# Success Criteria

Frontend sau khi hoàn thành phải:

- Mở website là Home Page.
- Guest có thể khám phá sản phẩm.
- Chỉ yêu cầu Login khi cần.
- ROLE_USER có trải nghiệm thuê đồ.
- ROLE_ADMIN có trải nghiệm quản trị.
- Navigation rõ ràng.
- Giao diện hiện đại hơn phiên bản hiện tại.
- Phù hợp với mô hình Marketplace thay vì Dashboard Application.