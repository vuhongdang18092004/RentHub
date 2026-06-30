-- 1.CÁC KIỂU DỮ LIỆU ENUM (POSTGRESQL)
CREATE TYPE user_role AS ENUM ('ROLE_USER', 'ROLE_ADMIN');
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'BLOCKED');
CREATE TYPE product_status AS ENUM ('PENDING', 'AVAILABLE', 'RENTED', 'UNAVAILABLE','BLOCKED');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE rental_status AS ENUM ('WAITING_PAYMENT', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('PAYOS', 'VNPAY');
CREATE TYPE payment_type AS ENUM ('DEPOSIT', 'RENTAL_FEE', 'REFUND');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
CREATE TYPE report_status AS ENUM ('PENDING', 'RESOLVED', 'REJECTED');
CREATE TYPE message_type AS ENUM ('TEXT', 'PRODUCT', 'IMAGE');

-- 2. CÁC BẢNG (TABLES)

-- Bảng 1: users
CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       full_name VARCHAR(255),
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       phone VARCHAR(20) UNIQUE,
                       avatar_url VARCHAR(255),
                       address VARCHAR(255),
                       latitude DECIMAL(10,7),
                       longitude DECIMAL(10,7),
                       role user_role DEFAULT 'ROLE_USER',
                       status user_status DEFAULT 'PENDING',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 2: categories
CREATE TABLE categories (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            slug VARCHAR(255) UNIQUE NOT NULL,
                            description TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng 3: products
CREATE TABLE products (
                          id BIGSERIAL PRIMARY KEY,
                          owner_id BIGINT NOT NULL,
                          category_id BIGINT NOT NULL,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          price_per_day DECIMAL(12,2) NOT NULL,
                          deposit_amount DECIMAL(12,2) NOT NULL,
                          address VARCHAR(255),
                          latitude DECIMAL(10,7),
                          longitude DECIMAL(10,7),
                          status product_status DEFAULT 'AVAILABLE',
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_product_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Bảng 4: product_images
CREATE TABLE product_images (
                                id BIGSERIAL PRIMARY KEY,
                                product_id BIGINT NOT NULL,
                                image_url VARCHAR(255) NOT NULL,
                                is_primary BOOLEAN DEFAULT FALSE,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- ON DELETE CASCADE: Khi xóa sản phẩm, tự động xóa hết ảnh liên quan
                                CONSTRAINT fk_image_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng 5: rental_requests
CREATE TABLE rental_requests (
                                 id BIGSERIAL PRIMARY KEY,
                                 product_id BIGINT NOT NULL,
                                 renter_id BIGINT NOT NULL,
                                 owner_id BIGINT NOT NULL,
                                 requested_price DECIMAL(12,2) NOT NULL,
                                 requested_deposit DECIMAL(12,2) NOT NULL,
                                 start_date DATE NOT NULL,
                                 end_date DATE NOT NULL,
                                 message TEXT,
                                 status request_status DEFAULT 'PENDING',
                                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                 CONSTRAINT fk_request_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
                                 CONSTRAINT fk_request_renter FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE RESTRICT,
                                 CONSTRAINT fk_request_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng 6: rentals (Đơn thuê chính thức)
CREATE TABLE rentals (
                         id BIGSERIAL PRIMARY KEY,
                         request_id BIGINT NOT NULL,
                         product_id BIGINT NOT NULL,
                         renter_id BIGINT NOT NULL,
                         owner_id BIGINT NOT NULL,
                         start_date DATE NOT NULL,
                         end_date DATE NOT NULL,
                         rental_days INT NOT NULL,
                         price_per_day DECIMAL(12,2) NOT NULL,
                         deposit_amount DECIMAL(12,2) NOT NULL,
                         total_price DECIMAL(12,2) NOT NULL,
                         status rental_status DEFAULT 'WAITING_PAYMENT',
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT fk_rental_request FOREIGN KEY (request_id) REFERENCES rental_requests(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_rental_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_rental_renter FOREIGN KEY (renter_id) REFERENCES users(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_rental_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng 7: payments
CREATE TABLE payments (
                          id BIGSERIAL PRIMARY KEY,
                          rental_id BIGINT NOT NULL,
                          payer_id BIGINT NOT NULL,
                          payment_method payment_method NOT NULL,
                          payment_type payment_type NOT NULL,
                          amount DECIMAL(12,2) NOT NULL,
                          transaction_code VARCHAR(255),
                          status payment_status DEFAULT 'PENDING',
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_payment_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_payment_payer FOREIGN KEY (payer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng 8: tracking
CREATE TABLE tracking (
                          id BIGSERIAL PRIMARY KEY,
                          rental_id BIGINT NOT NULL,
                          owner_pickup_confirm BOOLEAN DEFAULT FALSE,
                          renter_pickup_confirm BOOLEAN DEFAULT FALSE,
                          owner_return_confirm BOOLEAN DEFAULT FALSE,
                          renter_return_confirm BOOLEAN DEFAULT FALSE,
                          owner_pickup_at TIMESTAMP,
                          renter_pickup_at TIMESTAMP,
                          owner_return_at TIMESTAMP,
                          renter_return_at TIMESTAMP,
                          owner_pickup_image VARCHAR(255),
                          renter_pickup_image VARCHAR(255),
                          owner_return_image VARCHAR(255),
                          renter_return_image VARCHAR(255),
                          note TEXT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_tracking_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE RESTRICT
);

-- Bảng 9: reviews
CREATE TABLE reviews (
                         id BIGSERIAL PRIMARY KEY,
                         rental_id BIGINT NOT NULL,
                         reviewer_id BIGINT NOT NULL,
                         reviewed_user_id BIGINT NOT NULL,
                         rating INT CHECK (rating >= 1 AND rating <= 5), -- Giới hạn đánh giá từ 1 đến 5 sao
                         comment TEXT,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT fk_review_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_review_reviewed_user FOREIGN KEY (reviewed_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Bảng 10: reports
CREATE TABLE reports (
                         id BIGSERIAL PRIMARY KEY,
                         reporter_id BIGINT NOT NULL,
                         reported_user_id BIGINT NOT NULL,
                         rental_id BIGINT,
                         product_id BIGINT,
                         reason VARCHAR(255) NOT NULL,
                         description TEXT,
                         status report_status DEFAULT 'PENDING',
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_report_reported_user FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_report_rental FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_report_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Bảng 11: conversations
CREATE TABLE conversations (
                               id BIGSERIAL PRIMARY KEY,
                               user1_id BIGINT NOT NULL,
                               user2_id BIGINT NOT NULL,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                               CONSTRAINT fk_conversation_user1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE RESTRICT,
                               CONSTRAINT fk_conversation_user2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE RESTRICT,
                               CONSTRAINT user1_user2_unique UNIQUE (user1_id, user2_id)
);

-- Bảng 12: messages
CREATE TABLE messages (
                          id BIGSERIAL PRIMARY KEY,
                          conversation_id BIGINT NOT NULL,
                          sender_id BIGINT NOT NULL,
                          message_type message_type DEFAULT 'TEXT',
                          content TEXT NOT NULL,
                          referenced_product_id BIGINT DEFAULT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          CONSTRAINT fk_message_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_message_product FOREIGN KEY (referenced_product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- Bảng 13: favorites
CREATE TABLE favorites (
                           id BIGSERIAL PRIMARY KEY,
                           user_id BIGINT NOT NULL,
                           product_id BIGINT NOT NULL,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                           CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                           CONSTRAINT fk_favorite_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                           CONSTRAINT user_product_favorite_unique UNIQUE (user_id, product_id)
);

-- Bảng 13: Bảng quản lý token xác thực email
CREATE TABLE verification_tokens (
                                     id BIGSERIAL PRIMARY KEY,
                                     token VARCHAR(255) NOT NULL UNIQUE,
                                     user_id BIGINT NOT NULL UNIQUE,
                                     expiry_date TIMESTAMP NOT NULL,
                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                     CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. CÁC CHỈ MỤC (INDEXES) TỐI ƯU HIỆU NĂNG

CREATE INDEX idx_products_name ON products(name);                       -- Tìm kiếm tên sản phẩm nhanh hơn
CREATE INDEX idx_products_category ON products(category_id);             -- Lọc sản phẩm theo danh mục
CREATE INDEX idx_products_owner ON products(owner_id);                   -- Tìm sản phẩm của một chủ xe/chủ đồ
CREATE INDEX idx_rentals_status ON rentals(status);                       -- Quản lý/Lọc trạng thái đơn hàng nhanh chóng
CREATE INDEX idx_rentals_renter ON rentals(renter_id);                   -- Người thuê tìm lịch sử đơn hàng của mình
CREATE INDEX idx_rentals_owner ON rentals(owner_id);                     -- Người cho thuê tìm đơn hàng khách đặt của mình
CREATE INDEX idx_messages_conversation ON messages(conversation_id); -- Lấy tin nhắn theo phòng chat
CREATE INDEX idx_tokens_value ON verification_tokens(token);         -- Tìm token khi user click link kích hoạt