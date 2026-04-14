# Sơ đồ Sequence Diagram - Luồng Công Việc Đối Tác (Partner)

Tài liệu này mô tả chi tiết quy trình từ lúc Chủ quán (Partner) nhập liệu, sử dụng AI cho đến khi được Admin phê duyệt.

## 1. Sơ đồ Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Partner as Chủ quán (Partner)
    participant FE as Frontend (React App)
    participant AI as Gemini AI (Google)
    participant BE as Backend (Node.js)
    participant DB as Database (JSON)
    actor Admin as Quản trị viên

    Note over Partner, FE: Giai đoạn 1: Chuẩn bị nội dung AI
    Partner->>FE: Nhập thông tin quán & Kịch bản gốc (VN)
    Partner->>FE: Nhấn "Kích hoạt AI Ma Thuật"
    FE->>AI: Gửi kịch bản VN (Dịch thuật)
    AI-->>FE: Trả về bản dịch (EN, ZH, KO, JA)
    
    loop Tạo Audio cho 5 ngôn ngữ
        FE->>AI: Gửi văn bản từng ngôn ngữ (TTS)
        AI-->>FE: Trả về dữ liệu Audio (Base64)
    end
    FE-->>Partner: Hiển thị kết quả & cho phép nghe thử

    Note over Partner, BE: Giai đoạn 2: Gửi yêu cầu phê duyệt
    Partner->>FE: Nhấn "Cập Nhật Thông Tin" (Lưu)
    FE->>BE: POST /api/requests (Kèm JWT Token)
    BE->>DB: Lưu vào bảng 'requests' (Status: pending)
    DB-->>BE: Xác nhận lưu
    BE-->>FE: Thông báo "Chờ duyệt"
    FE-->>Partner: Hiển thị trạng thái "Đang chờ Admin duyệt"

    Note over Admin, DB: Giai đoạn 3: Phê duyệt (Admin)
    Admin->>FE: Vào Admin Panel -> Tab Chờ Duyệt
    FE->>BE: GET /api/requests
    BE->>DB: Lấy danh sách 'pending'
    DB-->>BE: Trả về dữ liệu
    BE-->>FE: Hiển thị danh sách cho Admin
    Admin->>FE: Nhấn "Duyệt ✅"
    FE->>BE: POST /api/requests/:id/approve
    BE->>DB: Cập nhật Status: approved
    BE->>DB: Copy dữ liệu sang bảng 'restaurants'
    DB-->>BE: Xác nhận cập nhật
    BE-->>FE: Thông báo thành công
    FE-->>Admin: Cập nhật giao diện quản lý
```

## 2. Giải thích các bước quan trọng

1.  **Xử lý AI tại Frontend (Bước 3-8):** Để giảm tải cho Server và tận dụng API Key của người dùng, việc dịch và tạo Audio được thực hiện trực tiếp từ trình duyệt gọi đến Gemini API.
2.  **Cơ chế "Pending" (Bước 11):** Dữ liệu không ghi đè trực tiếp vào bản đồ công cộng mà nằm ở bảng trung gian `requests`. Điều này đảm bảo an ninh nội dung.
3.  **Chuyển đổi dữ liệu (Bước 21):** Khi Admin duyệt, hệ thống thực hiện thao tác "Atomic": vừa đánh dấu yêu cầu đã xong, vừa cập nhật/tạo mới bản ghi trong danh sách quán ăn chính thức.

## 3. Công cụ hỗ trợ
Bạn có thể copy đoạn mã trên vào:
*   [Mermaid Live Editor](https://mermaid.live/) để xuất ra file ảnh (PNG/SVG).
*   Các plugin Mermaid trên VS Code hoặc Notion để hiển thị trực tiếp.
