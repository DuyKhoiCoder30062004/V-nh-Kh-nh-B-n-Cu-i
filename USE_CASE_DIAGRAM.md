# Sơ đồ Use Case Diagram - Hệ thống Bản đồ Thực phẩm AI

Sơ đồ này mô tả các chức năng chính của hệ thống và sự tương tác của các nhóm người dùng khác nhau.

## 1. Sơ đồ Use Case

```mermaid
graph LR
    Guest((Khách tham quan))
    Partner((Chủ quán))
    Admin((Quản trị viên))

    subgraph "Hệ thống Food Map AI"
        UC1(Xem bản đồ & Tìm quán)
        UC2(Nghe giới thiệu AI)
        UC3(Đăng nhập / Đăng ký)
        UC4(Quản lý hồ sơ quán ăn)
        UC5(Sử dụng AI - Dịch & TTS)
        UC6(Gửi yêu cầu phê duyệt)
        UC7(Duyệt / Từ chối yêu cầu)
        UC8(Quản lý người dùng)
        UC9(Xem thống kê hệ thống)
    end

    Guest --- UC1
    Guest --- UC2
    Guest --- UC3

    Partner --- UC3
    Partner --- UC4
    Partner --- UC5
    Partner --- UC6

    Admin --- UC3
    Admin --- UC7
    Admin --- UC8
    Admin --- UC9
    Admin --- UC1
```

## 2. Mô tả các Tác nhân (Actors)

*   **Khách tham quan (Guest):** Người dùng cuối, sử dụng ứng dụng để tìm kiếm địa điểm ăn uống và nghe thuyết minh bằng ngôn ngữ của họ.
*   **Chủ quán (Partner):** Đối tác cung cấp dữ liệu, có quyền quản lý thông tin quán của mình nhưng cần thông qua kiểm duyệt.
*   **Quản trị viên (Admin):** Người kiểm soát toàn bộ hệ thống, phê duyệt nội dung và quản lý tài khoản.

## 3. Các mối quan hệ chính
*   **Partner & AI:** Partner là người duy nhất kích hoạt chức năng AI để tạo nội dung đa phương tiện cho quán của mình.
*   **Admin & Partner:** Admin đóng vai trò "người gác cổng" cho các yêu cầu mà Partner gửi lên.
