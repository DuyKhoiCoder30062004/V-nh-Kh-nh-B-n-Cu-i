# Sequence Diagrams: VoiceMap SaaS Interaction

Tài liệu này mô tả trình tự tương tác giữa các tác nhân (Actors) và các thành phần của hệ thống (Frontend, Backend, Database, Cloud AI).

## 1. Trình tự: Người dùng nghe thuyết minh (User Flow)
Mô tả cách một khách du lịch tương tác với bản đồ để nghe thuyết minh đa ngôn ngữ.

```mermaid
sequenceDiagram
    participant User as 👤 Khách du lịch
    participant App as 📱 Frontend (React)
    participant API as 🖥️ Backend (FastAPI)
    participant DB as 🗄️ Database (Postgres)

    Note over User, DB: Quy trình truy cập thông tin
    User->>App: Mở bản đồ/Quét QR
    App->>API: GET /api/nearby
    API->>DB: Truy vấn POIs & Audio Base64
    DB-->>API: Trả về danh sách dữ liệu
    API-->>App: Trả về JSON Data
    App-->>User: Hiển thị các Marker trên Bản đồ

    User->>App: Chọn 1 quán & Chọn ngôn ngữ
    App->>App: Kiểm tra Base64 trong dữ liệu đã tải
    alt Có sẵn Audio
        App->>User: Phát âm thanh (Audio.play)
        App->>API: POST /api/user/history (Chạy ngầm)
        API->>DB: Lưu lịch sử nghe
    else Chưa có Audio
        App->>User: Hiển thị "Nội dung đang cập nhật"
    end
```

---

## 2. Trình tự: Chủ quán tạo nội dung bằng AI (Owner AI Flow)
Mô tả quy trình chủ quán sử dụng sức mạnh của Gemini và ElevenLabs để tự động hóa kịch bản.

```mermaid
sequenceDiagram
    participant Owner as 👔 Chủ quán (Owner)
    participant App as 🖥️ Admin Dashboard
    participant API as ⚙️ Backend API
    participant Gemini as 🤖 Google Gemini
    participant Eleven as 🗣️ ElevenLabs
    participant DB as 🗄️ Postgres DB

    Owner->>App: Nhập mô tả (Tiếng Việt) & Bấm AI
    App->>API: POST /api/translate
    
    rect rgb(240, 240, 240)
        Note right of API: Quy trình AI (Translate)
        API->>Gemini: Gửi kịch bản gốc
        Gemini-->>API: Trả về JSON (4-15 ngôn ngữ)
        API->>DB: Cập nhật bản dịch vào Restaurant table
    end
    
    API-->>App: Trả về text đã dịch
    App-->>Owner: Hiển thị bản dịch lên Form

    Owner->>App: Xác nhận & Bấm Tạo Audio (TTS)
    App->>API: POST /api/tts
    
    rect rgb(230, 242, 255)
        Note right of API: Quy trình AI (Voice Generation)
        API->>Eleven: Gửi text tương ứng ngôn ngữ
        Eleven-->>API: Trả về byte dữ liệu MP3
        API->>API: Chuyển đổi sang Base64
        API->>DB: Lưu chuỗi Base64 vào cột audio_xx
    end
    
    API-->>App: Trả về base64 thành công
    App-->>Owner: Hiển thị trạng thái ✅ Sẵn sàng
```

---

## 3. Trình tự: Quản trị viên điều hành hệ thống (Admin Flow)
Mô tả cách Admin quản lý gói cước và giám sát hoạt động.

```mermaid
sequenceDiagram
    participant Admin as ⚖️ Quản trị viên
    participant App as 🛠️ Admin Panel
    participant API as ⚙️ Backend API
    participant DB as 🗄️ Postgres DB

    Admin->>App: Truy cập Dashboard
    App->>API: GET /api/stats
    API->>DB: COUNT Users/Restaurants/Logs
    DB-->>API: Dữ liệu thống kê
    API-->>App: Trả về JSON Stats
    App-->>Admin: Hiển thị biểu đồ & con số

    Admin->>App: Nâng cấp gói dịch vụ cho Chủ quán
    App->>API: PUT /api/admin/owners/{id}
    API->>DB: Cập nhật package_id & status
    DB-->>API: Thành công
    API-->>App: Phản hồi "Đã nâng cấp"
    App-->>Admin: Thông báo ✅ Thành công
```

---

## 4. Ghi chú kỹ thuật
*   **Tính đồng bộ:** Quy trình dịch thuật (Translate) diễn ra đồng bộ để Owner thấy kết quả ngay.
*   **Tính bất đồng bộ (giả lập):** Luồng Audio được khuyến khích chạy từng ngôn ngữ để tránh Timeout API.
*   **Bảo mật:** Mọi request từ API đến DB đều được mã hóa và các API AI được bảo vệ bởi Key lưu tại biến môi trường Backend.
