# Sơ đồ Use Case Diagram - Hệ thống Bản đồ Thực phẩm AI

Sơ đồ này mô tả các chức năng chính của hệ thống và sự tương tác của các nhóm người dùng khác nhau.

## 1. Sơ đồ Use Case

```mermaid
useCaseDiagram
    actor "Khách tham quan (Guest)" as Guest
    actor "Chủ quán (Partner)" as Partner
    actor "Quản trị viên (Admin)" as Admin

    package "Hệ thống Food Map AI" {
        usecase "Xem bản đồ & Tìm quán" as UC1
        usecase "Nghe giới thiệu AI (Đa ngôn ngữ)" as UC2
        usecase "Đăng nhập / Đăng ký" as UC3
        usecase "Quản lý hồ sơ quán ăn" as UC4
        usecase "Sử dụng AI (Dịch & TTS)" as UC5
        usecase "Gửi yêu cầu phê duyệt" as UC6
        usecase "Duyệt / Từ chối yêu cầu" as UC7
        usecase "Quản lý người dùng" as UC8
        usecase "Xem thống kê hệ thống" as UC9
    }

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3

    Partner --> UC3
    Partner --> UC4
    Partner --> UC5
    Partner --> UC6

    Admin --> UC3
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC1
```

## 2. Mô tả các Tác nhân (Actors)

*   **Khách tham quan (Guest):** Người dùng cuối, sử dụng ứng dụng để tìm kiếm địa điểm ăn uống và nghe thuyết minh bằng ngôn ngữ của họ.
*   **Chủ quán (Partner):** Đối tác cung cấp dữ liệu, có quyền quản lý thông tin quán của mình nhưng cần thông qua kiểm duyệt.
*   **Quản trị viên (Admin):** Người kiểm soát toàn bộ hệ thống, phê duyệt nội dung và quản lý tài khoản.

## 3. Các mối quan hệ chính
*   **Partner & AI:** Partner là người duy nhất kích hoạt chức năng AI để tạo nội dung đa phương tiện cho quán của mình.
*   **Admin & Partner:** Admin đóng vai trò "người gác cổng" cho các yêu cầu mà Partner gửi lên.
