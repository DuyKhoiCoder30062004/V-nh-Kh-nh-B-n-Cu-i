# Sơ đồ Activity Diagram - Quy trình Phê duyệt Thông tin

Sơ đồ này mô tả luồng hoạt động chi tiết từ khi Partner tạo nội dung cho đến khi nội dung đó được hiển thị công khai.

## 1. Sơ đồ Activity Diagram

```mermaid
flowchart TD
    Start([Bắt đầu]) --> Login[Partner đăng nhập]
    Login --> Input[Nhập thông tin quán & Kịch bản VN]
    
    subgraph AI_Process [Xử lý AI - Frontend]
        PressAI[Nhấn nút AI Ma Thuật] --> GeminiTrans[Gemini dịch thuật]
        GeminiTrans --> GeminiTTS[Gemini tạo Audio TTS]
    end
    
    Input --> PressAI
    GeminiTTS --> Review{Partner nghe thử?}
    
    Review -- "Không hài lòng" --> Input
    Review -- "Hài lòng" --> Save[Nhấn Lưu - Gửi yêu cầu]
    
    Save --> Backend[Backend tạo Pending Request]
    
    subgraph Admin_Process [Quản trị - Admin]
        AdminLogin[Admin đăng nhập] --> ViewReq[Xem danh sách Chờ duyệt]
        ViewReq --> Check{Nội dung hợp lệ?}
        Check -- "Đồng ý" --> Approve[Nhấn Duyệt]
        Check -- "Từ chối" --> Reject[Nhấn Từ chối]
    end
    
    Backend --> AdminLogin
    
    Approve --> UpdateDB[Cập nhật Database chính]
    UpdateDB --> NotifyApprove([Thông báo: Đã đăng bản đồ])
    
    Reject --> NotifyReject([Thông báo: Yêu cầu bị từ chối])
    
    NotifyApprove --> End([Kết thúc])
    NotifyReject --> End
```

## 2. Các điểm quyết định (Decision Points)
1.  **Hài lòng?**: Partner có quyền xem trước kết quả AI tạo ra trước khi gửi cho Admin. Điều này giúp giảm thiểu các yêu cầu sai sót.
2.  **Nội dung hợp lệ?**: Admin kiểm tra tính xác thực của hình ảnh, tọa độ và ngôn ngữ để đảm bảo chất lượng dữ liệu trên bản đồ.

## 3. Kết quả cuối cùng
*   Nếu **Đồng ý**: Quán ăn sẽ xuất hiện trên bản đồ cho tất cả người dùng xem.
*   Nếu **Từ chối**: Partner cần xem lại lý do và thực hiện gửi lại yêu cầu mới.
