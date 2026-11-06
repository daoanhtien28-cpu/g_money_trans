# Tài Liệu API Giao Dịch Gần Đây (Recent Transactions API)

Tài liệu hướng dẫn tích hợp và sử dụng API quản lý **Danh sách giao dịch gần đây (tài khoản người nhận gần đây - 최근 보낸 계좌)** dành cho ứng dụng di động và frontend.

---

## 1. Tổng quan & Luồng hoạt động

- **Mục đích**: Lưu trữ và quản lý danh sách các tài khoản ngân hàng thụ hưởng mà người dùng đã từng chuyển tiền đến hoặc tự thêm/sửa/xóa trong danh bạ chuyển khoản nhanh.
- **Xác thực (Authentication)**: Tất cả API đều yêu cầu Header:
  ```http
  Authorization: Bearer <ACCESS_TOKEN>
  ```
- **Đặc điểm & Lưu ý**:
  - Quản lý độc lập thông qua bộ API `/recent-transactions`.
  - Khi thêm tài khoản chỉ có `bankCode` (vd: `'KB'`), hệ thống tự động điền `name` (vd: `'국민은행'`) và `imageUrl` (vd: `'assets/images/bank/bank_kb.png'`) từ danh mục ngân hàng hệ thống nếu chưa có.
  - **Không có dữ liệu mẫu (dummy data)**: Trả về mảng rỗng `[]` khi người dùng chưa có giao dịch nào và chỉ hiển thị đúng các bản ghi do người dùng/client chủ động thêm hoặc nhập.

---

## 2. Cấu trúc dữ liệu (Data Model)

Mỗi đối tượng giao dịch gần đây gồm các thuộc tính sau:

```typescript
interface RecentTransaction {
  id: string;             // ID định danh bản ghi (MongoDB ObjectId)
  bankCode?: string;      // Mã viết tắt ngân hàng (KB, SH, SHINHAN, NH, WOORI, HANA...)
  name: string;          // Tên ngân hàng / đơn vị (국민은행, 수협, 신한은행...)
  imageUrl: string;      // Đường dẫn ảnh / logo ngân hàng (assets/images/bank/...)
  accountNumber: string; // Số tài khoản người nhận
  accountName: string;   // Tên người nhận / chủ tài khoản (예금주명)
  createdAt: string;     // Thời điểm tạo (ISO 8601)
  updatedAt: string;     // Thời điểm cập nhật cuối (dùng để sắp xếp mới nhất)
}
```

---

## 3. Bảng tổng hợp Endpoints

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/recent-transactions` | Lấy danh sách giao dịch gần đây của người dùng |
| `GET` | `/transactions/recent` | Alias lấy danh sách giao dịch gần đây |
| `GET` | `/recent-transactions/:id` | Xem chi tiết một giao dịch gần đây |
| `POST` | `/recent-transactions` | Thêm mới 1 giao dịch gần đây (hoặc mảng nhiều mục) |
| `POST` | `/recent-transactions/bulk` | Nhập danh sách hàng loạt (`bulk import`) |
| `PATCH` | `/recent-transactions/:id` | Cập nhật / sửa thông tin một giao dịch gần đây |
| `PUT` | `/recent-transactions/:id` | Cập nhật / thay thế thông tin một giao dịch gần đây |
| `DELETE` | `/recent-transactions/:id` | Xóa một giao dịch gần đây theo ID |
| `DELETE` | `/recent-transactions` | Xóa tất cả giao dịch gần đây của người dùng |

---

## 4. Chi tiết từng API

### 4.1. Lấy danh sách giao dịch gần đây
- **Method**: `GET`
- **Path**: `/recent-transactions` (hoặc `/transactions/recent`)
- **Headers**:
  ```http
  Authorization: Bearer {{token}}
  ```
- **Response Success (200 OK)**:
```json
[
  {
    "id": "673f1a2b89c3e4567890abcd",
    "bankCode": "KB",
    "name": "국민은행",
    "imageUrl": "assets/images/bank/bank_kb.png",
    "accountNumber": "9876 543 210",
    "accountName": "자연애마트",
    "createdAt": "2026-09-24T10:00:00.000Z",
    "updatedAt": "2026-09-24T10:00:00.000Z"
  },
  {
    "id": "673f1a2b89c3e4567890abce",
    "bankCode": "SHINHAN",
    "name": "신한은행",
    "imageUrl": "assets/images/bank/bank_shinhan.png",
    "accountNumber": "110-234-567890",
    "accountName": "김철수",
    "createdAt": "2026-09-24T09:30:00.000Z",
    "updatedAt": "2026-09-24T09:30:00.000Z"
  }
]
```

---

### 4.2. Thêm mới một giao dịch gần đây
- **Method**: `POST`
- **Path**: `/recent-transactions`
- **Request Body**:
```json
{
  "bankCode": "KB",
  "name": "국민은행",
  "imageUrl": "assets/images/bank/bank_kb.png",
  "accountNumber": "123-456-7890",
  "accountName": "홍길동"
}
```
*(Nếu đã có tài khoản trùng `accountNumber` và `bankCode`, hệ thống tự động cập nhật thông tin và đẩy lên đầu danh sách).*

- **Response Success (201 Created)**:
```json
{
  "id": "673f1a2b89c3e4567890abcf",
  "bankCode": "KB",
  "name": "국민은행",
  "imageUrl": "assets/images/bank/bank_kb.png",
  "accountNumber": "123-456-7890",
  "accountName": "홍길동",
  "createdAt": "2026-09-24T10:15:00.000Z",
  "updatedAt": "2026-09-24T10:15:00.000Z"
}
```

---

### 4.3. Nhập danh sách hàng loạt (Bulk Import)
- **Method**: `POST`
- **Path**: `/recent-transactions/bulk`
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer {{token}}
  ```
- **Request Body Option 1 (Wrapper object)**:
```json
{
  "items": [
    {
      "bankCode": "KB",
      "name": "국민은행",
      "imageUrl": "assets/images/bank/bank_kb.png",
      "accountNumber": "123-456-7890",
      "accountName": "홍길동"
    },
    {
      "bankCode": "NH",
      "name": "농협",
      "imageUrl": "assets/images/bank/bank_nh.png",
      "accountNumber": "302-0987-6543-21",
      "accountName": "이영희"
    }
  ]
}
```
- **Request Body Option 2 (Mảng trực tiếp)**:
```json
[
  {
    "bankCode": "KB",
    "name": "국민은행",
    "imageUrl": "assets/images/bank/bank_kb.png",
    "accountNumber": "123-456-7890",
    "accountName": "홍길동"
  }
]
```

- **Response Success (201 Created)**: Trả về danh sách các đối tượng đã được nhập vào hệ thống.

---

### 4.4. Xem chi tiết một giao dịch gần đây
- **Method**: `GET`
- **Path**: `/recent-transactions/:id`
- **Response Success (200 OK)**:
```json
{
  "id": "673f1a2b89c3e4567890abcd",
  "bankCode": "KB",
  "name": "국민은행",
  "imageUrl": "assets/images/bank/bank_kb.png",
  "accountNumber": "9876 543 210",
  "accountName": "자연애마트",
  "createdAt": "2026-09-24T10:00:00.000Z",
  "updatedAt": "2026-09-24T10:00:00.000Z"
}
```

---

### 4.5. Chỉnh sửa một giao dịch gần đây
- **Method**: `PATCH` hoặc `PUT`
- **Path**: `/recent-transactions/:id`
- **Request Body** (có thể cập nhật 1 hoặc nhiều trường):
```json
{
  "accountName": "홍길동 (Bạn thân)",
  "accountNumber": "999-888-777"
}
```
- **Response Success (200 OK)**: Trả về đối tượng sau khi cập nhật thành công.

---

### 4.6. Xóa một giao dịch gần đây
- **Method**: `DELETE`
- **Path**: `/recent-transactions/:id`
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "message": "Đã xóa giao dịch gần đây thành công"
}
```

---

### 4.7. Xóa toàn bộ danh sách giao dịch gần đây
- **Method**: `DELETE`
- **Path**: `/recent-transactions`
- **Response Success (200 OK)**:
```json
{
  "success": true,
  "deletedCount": 5
}
```

---

## 5. Ví dụ cURL thao tác nhanh

### Lấy danh sách:
```bash
curl -X GET "http://localhost:3000/recent-transactions" \
  -H "Authorization: Bearer <TOKEN>"
```

### Thêm mới một mục:
```bash
curl -X POST "http://localhost:3000/recent-transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "bankCode": "KB",
    "name": "국민은행",
    "imageUrl": "assets/images/bank/bank_kb.png",
    "accountNumber": "9876 543 210",
    "accountName": "자연애마트"
  }'
```

### Sửa thông tin:
```bash
curl -X PATCH "http://localhost:3000/recent-transactions/<ID>" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "accountName": "자연애마트 (Gần nhà)"
  }'
```

### Xóa một mục:
```bash
curl -X DELETE "http://localhost:3000/recent-transactions/<ID>" \
  -H "Authorization: Bearer <TOKEN>"
```
