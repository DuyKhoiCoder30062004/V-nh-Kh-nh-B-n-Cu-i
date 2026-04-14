# Sơ đồ Activity Diagram - Quy trình Phê duyệt Thông tin

Sơ đồ này mô tả luồng hoạt động chi tiết từ khi Partner tạo nội dung cho đến khi nội dung đó được hiển thị công khai.

## 1. Sơ đồ Activity Diagram

```mermaid
activityDiagram
    start
    :Partner đăng nhập;
    :Nhập thông tin quán ăn;
    :Nhập kịch bản Tiếng Việt;
    
    partition "Xử lý AI (Frontend)" {
        :Nhấn nút AI Ma Thuật;
        :Gemini dịch sang 4 ngôn ngữ;
        :Gemini tạo 5 file Audio TTS;
    }
    
    :Partner kiểm tra & nghe thử;
    
    if (Hài lòng?) then (Có)
        :Nhấn Lưu (Gửi yêu cầu);
        :Backend tạo bản ghi 'Pending Request';
    else (Không)
        :Chỉnh sửa lại kịch bản;
        backward: Quay lại nhập liệu;
    endif

    partition "Quản trị (Admin)" {
        :Admin đăng nhập;
        :Vào danh sách Chờ duyệt;
        :Xem chi tiết yêu cầu;
        
        if (Nội dung hợp lệ?) then (Đồng ý)
            :Nhấn Duyệt;
            :Hệ thống cập nhật Database chính;
            :Trạng thái yêu cầu -> Approved;
        else (Từ chối)
            :Nhấn Từ chối;
            :Trạng thái yêu cầu -> Rejected;
        endif
    }

    :Thông báo kết quả cho Partner;
    stop
```

## 2. Các điểm quyết định (Decision Points)
1.  **Hài lòng?**: Partner có quyền xem trước kết quả AI tạo ra trước khi gửi cho Admin. Điều này giúp giảm thiểu các yêu cầu sai sót.
2.  **Nội dung hợp lệ?**: Admin kiểm tra tính xác thực của hình ảnh, tọa độ và ngôn ngữ để đảm bảo chất lượng dữ liệu trên bản đồ.

## 3. Kết quả cuối cùng
*   Nếu **Đồng ý**: Quán ăn sẽ xuất hiện trên bản đồ cho tất cả người dùng xem.
*   Nếu **Từ chối**: Partner cần xem lại lý do và thực hiện gửi lại yêu cầu mới.
