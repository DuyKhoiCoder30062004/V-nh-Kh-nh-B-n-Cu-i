# Kế hoạch Tiến hóa Hệ thống sang Mô hình SaaS (Subscription Model)

Dựa trên phản hồi từ Thầy, hệ thống cần chuyển đổi từ một ứng dụng quản lý đơn thuần sang mô hình **Bên thứ ba cung cấp dịch vụ (SaaS)**. Dưới đây là phân tích hiện trạng và các bước cần thực hiện để đi đúng hướng.

## 1. Xác nhận hướng đi hiện tại
*   **Đúng hướng:** Chúng ta đã có hệ thống phân quyền (Admin, Partner, Guest) và quy trình phê duyệt (Approval Workflow). Đây là nền tảng quan trọng.
*   **Chưa đúng hướng:** Hiện tại hệ thống đang coi mỗi Partner là một đối tác đơn lẻ với quyền lợi như nhau. Thiếu thực thể **"Gói dịch vụ" (Subscription Plan)** để giới hạn tài nguyên.

## 2. Các tính năng còn thiếu (Gaps)

### A. Quản lý Gói dịch vụ (Plan Management)
Hệ thống cần định nghĩa các gói (ví dụ: Basic, Pro, Enterprise) với các thông số:
*   **Max POIs:** Số lượng quán ăn tối đa được tạo.
*   **Max Languages:** Số lượng ngôn ngữ AI được phép sử dụng.
*   **Price:** Giá thuê (để mô phỏng mô hình kinh doanh).

### B. Quản lý Đăng ký (Subscription Logic)
*   Mỗi tài khoản `partner` khi đăng ký hoặc được Admin tạo phải gắn liền với một `plan_id`.
*   Admin có quyền nâng cấp/hạ cấp gói của Partner.

### C. Kiểm soát tài nguyên (Resource Enforcement)
*   **Giới hạn số lượng:** Khi Partner nhấn "Thêm quán", hệ thống phải check: `count(my_pois) < plan.max_pois`.
*   **Giới hạn ngôn ngữ:** Trong giao diện AI, Partner chỉ được chọn tối đa `plan.max_languages` từ danh sách ngôn ngữ hệ thống hỗ trợ.

## 3. Đề xuất thay đổi cấu trúc Database

Cần bổ sung bảng `plans` và cập nhật bảng `users`:

```json
{
  "plans": [
    {
      "id": "basic",
      "name": "Gói Cơ Bản",
      "max_pois": 1,
      "max_langs": 2,
      "price": "500.000đ/tháng"
    },
    {
      "id": "pro",
      "name": "Gói Chuyên Nghiệp",
      "max_pois": 5,
      "max_langs": 5,
      "price": "2.000.000đ/tháng"
    }
  ],
  "users": [
    {
      "id": 123,
      "username": "partner_01",
      "role": "partner",
      "plan_id": "basic"
    }
  ]
}
```

## 4. Lộ trình thực hiện (Roadmap)

1.  **Bước 1:** Cập nhật `server.ts` để khởi tạo danh sách `plans` mặc định.
2.  **Bước 2:** Cập nhật giao diện Admin để cho phép gán Gói dịch vụ khi tạo/sửa User.
3.  **Bước 3:** Cập nhật giao diện Partner:
    *   Hiển thị thông tin gói đang dùng (Ví dụ: "Bạn đang dùng gói Basic: 1/1 quán, 2/5 ngôn ngữ").
    *   Khóa nút "Thêm quán" nếu đã đạt giới hạn.
    *   Khóa các lựa chọn ngôn ngữ AI nếu vượt quá giới hạn của gói.
4.  **Bước 4:** Thêm trang "Nâng cấp gói" cho Partner (mô phỏng).

---
**Kết luận:** Dự án hiện tại đã có "khung xương" tốt, nhưng cần đắp thêm "thịt" là logic kinh doanh SaaS để đáp ứng đúng yêu cầu của Thầy. Tôi sẽ đợi lệnh của bạn để bắt đầu triển khai các thay đổi này vào code.
