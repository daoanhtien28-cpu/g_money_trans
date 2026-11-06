# 📊 Tài Liệu Tích Hợp API Lịch Sử Giao Dịch (Full CRUD) Cho Front-End

- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Xác thực:** Yêu cầu Header `Authorization: Bearer <accessToken>` cho tất cả API.
- **Bảo mật dữ liệu:** Mọi thao tác (Xem danh sách, Xem chi tiết, Thêm mới, Sửa, Xóa) đều tự động scoped theo tài khoản người dùng đang đăng nhập dựa trên token. Người dùng này không thể truy cập hoặc thao tác vào giao dịch của người dùng khác.

---

## 📌 Bảng Tổng Hợp Endpoints CRUD

### 1. Chuyển tiền quốc tế (International Transactions)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/internal-transaction` | Lấy danh sách giao dịch (có phân trang & bộ lọc) |
| `POST` | `/api/internal-transaction` | Tạo mới một giao dịch chuyển tiền quốc tế |
| `GET` | `/api/internal-transaction/:id` | Xem chi tiết biên lai giao dịch theo ID |
| `PATCH` | `/api/internal-transaction/:id` | Cập nhật / sửa thông tin giao dịch theo ID |
| `DELETE` | `/api/internal-transaction/:id` | Xóa một giao dịch theo ID |

### 2. Chuyển tiền nội địa (Domestic Transactions)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/domestic-transaction` | Lấy danh sách giao dịch nội địa (GmoneyPay & GmoneyWallet) |
| `POST` | `/api/domestic-transaction` | Tạo mới một giao dịch chuyển tiền nội địa |
| `GET` | `/api/domestic-transaction/:id` | Xem chi tiết biên lai giao dịch nội địa theo ID |
| `PATCH` | `/api/domestic-transaction/:id` | Cập nhật / sửa thông tin giao dịch nội địa theo ID |
| `DELETE` | `/api/domestic-transaction/:id` | Xóa một giao dịch nội địa theo ID |

### 3. Ngân hàng liên kết ngoài (Linked Bank Transactions)
| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/link-bank-transaction` | Lấy danh sách biến động số dư ngân hàng liên kết |
| `POST` | `/api/link-bank-transaction` | Tạo mới một biến động số dư ngân hàng |
| `GET` | `/api/link-bank-transaction/:id` | Xem chi tiết biến động số dư ngân hàng theo ID |
| `PATCH` | `/api/link-bank-transaction/:id` | Cập nhật / sửa giao dịch ngân hàng theo ID |
| `DELETE` | `/api/link-bank-transaction/:id` | Xóa một giao dịch ngân hàng theo ID |

---

## 1. Chi Tiết API Chuyển Tiền Quốc Tế (`/api/internal-transaction`)

Chỉ sử dụng tài khoản **GmoneyPay**.

### 1.1. Lấy danh sách (`GET /api/internal-transaction`)
- **Query Params:**
  - `page`: Trang hiện tại (mặc định: `1`).
  - `limit`: Số bản ghi mỗi trang (mặc định: `20`, tối đa `100`).
  - `status`: `PENDING`, `PROCESSING`, `SUCCESS`, `FAILED`, `CANCELLED`.
  - `startDate`: Từ ngày (`YYYY-MM-DD`).
  - `endDate`: Đến ngày (`YYYY-MM-DD`).
- **Response mẫu (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "670ab18917ec355abc1f4501",
        "sourceAccountType": "GMONEY_PAY",
        "sourceAccountNumber": "GMP-KRW-882910",
        "senderName": "DAO ANH TIEN",
        "senderPhone": "01012345678",
        "recipientName": "NGUYEN VAN A",
        "recipientAccountNumber": "19036782910123",
        "recipientBankCode": "TCB",
        "recipientBankName": "Techcombank",
        "recipientCountry": "VN",
        "sendAmount": 1000000,
        "sendCurrency": "KRW",
        "receiveAmount": 18250000,
        "receiveCurrency": "VND",
        "exchangeRate": 18.25,
        "transferFee": 5000,
        "conversionFee": 2000,
        "totalDebited": 1007000,
        "status": "SUCCESS",
        "transferTime": "2026-10-12T12:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

### 1.2. Tạo mới (`POST /api/internal-transaction`)
- **Bảng tham số Request Body:**

| Trường | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `recipientName` | `string` | **Có** | - | Họ tên người nhận |
| `recipientAccountNumber` | `string` | **Có** | - | Số tài khoản ngân hàng nhận |
| `recipientBankCode` | `string` | **Có** | - | Mã ngân hàng nhận (TCB, VCB, MB,...) |
| `recipientBankName` | `string` | **Có** | - | Tên ngân hàng nhận (Techcombank,...) |
| `sendAmount` | `number` | **Có** | - | Số tiền gửi (KRW, tối thiểu 1,000) |
| `recipientCountry` | `string` | Không | `"VN"` | Quốc gia nhận tiền |
| `sendCurrency` | `string` | Không | `"KRW"` | Loại tiền gửi |
| `receiveCurrency` | `string` | Không | `"VND"` | Loại tiền nhận |
| `exchangeRate` | `number` | Không | `18.25` | Tỷ giá quy đổi |
| `transferFee` | `number` | Không | `5000` | Phí chuyển tiền (KRW) |
| `conversionFee` | `number` | Không | `2000` | Phí chuyển đổi ngoại tệ (KRW) |
| `receiveAmount` | `number` | Không | *Tự tính* | Số tiền nhận (`sendAmount * exchangeRate`) |
| `senderName` | `string` | Không | `"DAO ANH TIEN"` | Tên người gửi |
| `senderPhone` | `string` | Không | `"01012345678"` | SĐT người gửi |
| `status` | `string` | Không | `"SUCCESS"` | Trạng thái giao dịch |

- **Request Body mẫu:**
```json
{
  "recipientName": "NGUYEN VAN A",
  "recipientAccountNumber": "19036782910123",
  "recipientBankCode": "TCB",
  "recipientBankName": "Techcombank",
  "recipientCountry": "VN",
  "sendAmount": 1000000,
  "exchangeRate": 18.25,
  "transferFee": 5000,
  "conversionFee": 2000
}
```
- **Response Thành Công:** `201 Created` trả về đối tượng giao dịch đã tạo.

### 1.3. Xem chi tiết (`GET /api/internal-transaction/:id`)
- **Response:** `200 OK` trả về chi tiết object giao dịch. Nếu không tìm thấy trả về `404 Not Found`.

### 1.4. Chỉnh sửa (`PATCH /api/internal-transaction/:id`)
- **Request Body:** Truyền các trường cần cập nhật (ví dụ: đổi trạng thái sang `FAILED`, hoặc đổi số tiền gửi `sendAmount`). Hệ thống tự động tính lại `receiveAmount` và `totalDebited` nếu có sửa số tiền.
```json
{
  "sendAmount": 1500000,
  "status": "SUCCESS"
}
```

### 1.5. Xóa (`DELETE /api/internal-transaction/:id`)
- **Response mẫu (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Xóa giao dịch quốc tế thành công"
  }
}
```

---

## 2. Chi Tiết API Chuyển Tiền Nội Địa (`/api/domestic-transaction`)

Hỗ trợ cả **GmoneyPay** và **GmoneyWallet**.

### 2.1. Lấy danh sách (`GET /api/domestic-transaction`)
- **Query Params:** `page`, `limit`, `sourceType` (`GMONEY_PAY` / `GMONEY_WALLET`), `status`, `startDate`, `endDate`.
- **Response mẫu (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "670ab18917ec355abc1f4502",
        "sourceType": "GMONEY_WALLET",
        "sourceAccountId": "670a982910ab355abc1f4599",
        "sourceAccountNumber": "GMW-KRW-550192",
        "recipientName": "KIM MIN SOO",
        "recipientAccountNumber": "110482910293",
        "recipientBankCode": "SHINHAN",
        "recipientBankName": "Shinhan Bank",
        "amount": 150000,
        "fee": 0,
        "currency": "KRW",
        "message": "Tien an trua",
        "status": "SUCCESS",
        "transferTime": "2026-10-12T10:15:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

### 2.2. Tạo mới (`POST /api/domestic-transaction`)
- **Bảng tham số Request Body:**

| Trường | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `recipientName` | `string` | **Có** | - | Họ tên người nhận |
| `recipientAccountNumber` | `string` | **Có** | - | Số tài khoản người nhận |
| `recipientBankCode` | `string` | **Có** | - | Mã ngân hàng nhận (SHINHAN, KB, NH, HANA,...) |
| `amount` | `number` | **Có** | - | Số tiền chuyển (KRW, > 0) |
| `sourceType` | `string` | Không | `"GMONEY_WALLET"` | Nguồn tiền: `GMONEY_PAY` hoặc `GMONEY_WALLET` |
| `recipientBankName` | `string` | Không | `"Shinhan Bank"` | Tên ngân hàng nhận |
| `fee` | `number` | Không | `0` | Phí chuyển tiền (KRW) |
| `currency` | `string` | Không | `"KRW"` | Loại tiền tệ |
| `message` | `string` | Không | `""` | Nội dung chuyển khoản / Ghi chú |
| `status` | `string` | Không | `"SUCCESS"` | Trạng thái giao dịch |

- **Request Body mẫu:**
```json
{
  "sourceType": "GMONEY_WALLET",
  "recipientName": "KIM MIN SOO",
  "recipientAccountNumber": "110482910293",
  "recipientBankCode": "SHINHAN",
  "recipientBankName": "Shinhan Bank",
  "amount": 150000,
  "fee": 0,
  "message": "Tien an trua"
}
```
- **Response Thành Công:** `201 Created` trả về đối tượng giao dịch đã tạo.

### 2.3. Xem chi tiết (`GET /api/domestic-transaction/:id`)
- **Response:** `200 OK` trả về chi tiết object giao dịch nội địa.

### 2.4. Chỉnh sửa (`PATCH /api/domestic-transaction/:id`)
- **Request Body mẫu:**
```json
{
  "amount": 200000,
  "message": "Tien mua qua"
}
```

### 2.5. Xóa (`DELETE /api/domestic-transaction/:id`)
- **Response mẫu (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Xóa giao dịch nội địa thành công"
  }
}
```

---

## 3. Chi Tiết API Ngân Hàng Liên Kết (`/api/link-bank-transaction`)

Biến động số dư qua Open Banking của các ngân hàng liên kết ngoài (Shinhan, NH, KB,...).

### 3.1. Lấy danh sách (`GET /api/link-bank-transaction`)
- **Query Params:**
  - `page`, `limit`, `status`, `startDate`, `endDate`
  - `linkedBankAccountId` hoặc `bankId`: Lọc theo tài khoản ngân hàng cụ thể
  - `direction`: `IN` (cộng tiền +) hoặc `OUT` (trừ tiền -)
- **Response mẫu (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "670ab18917ec355abc1f4504",
        "linkedBankAccountId": "670a982910ab355abc1f4577",
        "bankCode": "SHINHAN",
        "bankName": "Shinhan Bank",
        "accountNumberMasked": "110614025931",
        "direction": "OUT",
        "amount": 50000,
        "balanceAfter": 256901,
        "currency": "KRW",
        "description": "Nap tien vao GmoneyPay",
        "status": "SUCCESS",
        "transactionTime": "2026-10-12T09:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

### 3.2. Tạo mới (`POST /api/link-bank-transaction`)
- **Bảng tham số Request Body:**

| Trường | Kiểu | Bắt buộc | Mặc định | Mô tả |
| :--- | :--- | :---: | :---: | :--- |
| `bankCode` | `string` | **Có** | - | Mã ngân hàng (SHINHAN, NH, KB, HANA,...) |
| `accountNumberMasked` | `string` | **Có** | - | Số tài khoản ngân hàng (ví dụ: `110614025931`) |
| `direction` | `string` | **Có** | - | Chiều giao dịch: `"IN"` (+) hoặc `"OUT"` (-) |
| `amount` | `number` | **Có** | - | Số tiền giao dịch (> 0) |
| `description` | `string` | **Có** | - | Nội dung biến động số dư / Memo |
| `linkedBankAccountId` | `string` | Không | *Tự mapping* | ID tài khoản ngân hàng liên kết |
| `bankName` | `string` | Không | `"<bankCode> Bank"` | Tên ngân hàng |
| `balanceAfter` | `number` | Không | `300000` | Số dư tài khoản sau giao dịch |
| `currency` | `string` | Không | `"KRW"` | Loại tiền tệ |
| `status` | `string` | Không | `"SUCCESS"` | Trạng thái giao dịch |

- **Request Body mẫu:**
```json
{
  "bankCode": "SHINHAN",
  "bankName": "Shinhan Bank",
  "accountNumberMasked": "110614025931",
  "direction": "OUT",
  "amount": 50000,
  "balanceAfter": 256901,
  "description": "Nap tien vao GmoneyPay"
}
```
- **Response Thành Công:** `201 Created` trả về đối tượng biến động số dư đã tạo.

### 3.3. Xem chi tiết (`GET /api/link-bank-transaction/:id`)
- **Response:** `200 OK` trả về chi tiết object biến động số dư theo `id`.

### 3.4. Chỉnh sửa (`PATCH /api/link-bank-transaction/:id`)
- **Request Body mẫu:**
```json
{
  "amount": 70000,
  "balanceAfter": 236901,
  "description": "Chuyen khoan tien nha"
}
```

### 3.5. Xóa (`DELETE /api/link-bank-transaction/:id`)
- **Response mẫu (`200 OK`):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Xóa giao dịch ngân hàng thành công"
  }
}
```

---

## 4. Code Mẫu Flutter Tích Hợp Đầy Đủ CRUD (`Dio`)

```dart
import 'package:dio/dio.dart';

class TransactionHistoryRemoteDataSource {
  final Dio _dio;

  TransactionHistoryRemoteDataSource(this._dio);

  // =========================================================================
  // 1. CHUYỂN TIỀN QUỐC TẾ (International Transactions)
  // =========================================================================

  /// 1.1. Lấy danh sách giao dịch quốc tế
  Future<({List<InternationalTransactionModel> items, PaginationModel pagination})>
      getInternationalTransactions({
    int page = 1,
    int limit = 20,
    String? status,
    String? startDate,
    String? endDate,
  }) async {
    final res = await _dio.get(
      '/internal-transaction',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
        if (startDate != null) 'startDate': startDate,
        if (endDate != null) 'endDate': endDate,
      },
    );
    final data = res.data['data'];
    final items = (data['items'] as List)
        .map((e) => InternationalTransactionModel.fromJson(e))
        .toList();
    final pagination = PaginationModel.fromJson(data['pagination']);
    return (items: items, pagination: pagination);
  }

  /// 1.2. Xem chi tiết giao dịch quốc tế
  Future<InternationalTransactionModel> getInternationalTransactionById(String id) async {
    final res = await _dio.get('/internal-transaction/$id');
    return InternationalTransactionModel.fromJson(res.data['data']);
  }

  /// 1.3. Tạo mới giao dịch quốc tế
  Future<InternationalTransactionModel> createInternationalTransaction(
      Map<String, dynamic> body) async {
    final res = await _dio.post('/internal-transaction', data: body);
    return InternationalTransactionModel.fromJson(res.data['data']);
  }

  /// 1.4. Chỉnh sửa giao dịch quốc tế
  Future<InternationalTransactionModel> updateInternationalTransaction(
      String id, Map<String, dynamic> body) async {
    final res = await _dio.patch('/internal-transaction/$id', data: body);
    return InternationalTransactionModel.fromJson(res.data['data']);
  }

  /// 1.5. Xóa giao dịch quốc tế
  Future<void> deleteInternationalTransaction(String id) async {
    await _dio.delete('/internal-transaction/$id');
  }

  // =========================================================================
  // 2. CHUYỂN TIỀN NỘI ĐỊA (Domestic Transactions)
  // =========================================================================

  /// 2.1. Lấy danh sách giao dịch nội địa
  Future<({List<DomesticTransactionModel> items, PaginationModel pagination})>
      getDomesticTransactions({
    int page = 1,
    int limit = 20,
    String? sourceType,
    String? status,
    String? startDate,
    String? endDate,
  }) async {
    final res = await _dio.get(
      '/domestic-transaction',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (sourceType != null) 'sourceType': sourceType,
        if (status != null) 'status': status,
        if (startDate != null) 'startDate': startDate,
        if (endDate != null) 'endDate': endDate,
      },
    );
    final data = res.data['data'];
    final items = (data['items'] as List)
        .map((e) => DomesticTransactionModel.fromJson(e))
        .toList();
    final pagination = PaginationModel.fromJson(data['pagination']);
    return (items: items, pagination: pagination);
  }

  /// 2.2. Xem chi tiết giao dịch nội địa
  Future<DomesticTransactionModel> getDomesticTransactionById(String id) async {
    final res = await _dio.get('/domestic-transaction/$id');
    return DomesticTransactionModel.fromJson(res.data['data']);
  }

  /// 2.3. Tạo mới giao dịch nội địa
  Future<DomesticTransactionModel> createDomesticTransaction(
      Map<String, dynamic> body) async {
    final res = await _dio.post('/domestic-transaction', data: body);
    return DomesticTransactionModel.fromJson(res.data['data']);
  }

  /// 2.4. Chỉnh sửa giao dịch nội địa
  Future<DomesticTransactionModel> updateDomesticTransaction(
      String id, Map<String, dynamic> body) async {
    final res = await _dio.patch('/domestic-transaction/$id', data: body);
    return DomesticTransactionModel.fromJson(res.data['data']);
  }

  /// 2.5. Xóa giao dịch nội địa
  Future<void> deleteDomesticTransaction(String id) async {
    await _dio.delete('/domestic-transaction/$id');
  }

  // =========================================================================
  // 3. NGÂN HÀNG LIÊN KẾT (Linked Bank Transactions)
  // =========================================================================

  /// 3.1. Lấy danh sách giao dịch ngân hàng
  Future<({List<LinkedBankTransactionModel> items, PaginationModel pagination})>
      getLinkedBankTransactions({
    int page = 1,
    int limit = 20,
    String? linkedBankAccountId,
    String? bankId,
    String? direction,
    String? status,
    String? startDate,
    String? endDate,
  }) async {
    final res = await _dio.get(
      '/link-bank-transaction',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (linkedBankAccountId != null) 'linkedBankAccountId': linkedBankAccountId,
        if (bankId != null) 'bankId': bankId,
        if (direction != null) 'direction': direction,
        if (status != null) 'status': status,
        if (startDate != null) 'startDate': startDate,
        if (endDate != null) 'endDate': endDate,
      },
    );
    final data = res.data['data'];
    final items = (data['items'] as List)
        .map((e) => LinkedBankTransactionModel.fromJson(e))
        .toList();
    final pagination = PaginationModel.fromJson(data['pagination']);
    return (items: items, pagination: pagination);
  }

  /// 3.2. Xem chi tiết giao dịch ngân hàng
  Future<LinkedBankTransactionModel> getLinkedBankTransactionById(String id) async {
    final res = await _dio.get('/link-bank-transaction/$id');
    return LinkedBankTransactionModel.fromJson(res.data['data']);
  }

  /// 3.3. Tạo mới biến động số dư ngân hàng
  Future<LinkedBankTransactionModel> createLinkedBankTransaction(
      Map<String, dynamic> body) async {
    final res = await _dio.post('/link-bank-transaction', data: body);
    return LinkedBankTransactionModel.fromJson(res.data['data']);
  }

  /// 3.4. Chỉnh sửa biến động số dư ngân hàng
  Future<LinkedBankTransactionModel> updateLinkedBankTransaction(
      String id, Map<String, dynamic> body) async {
    final res = await _dio.patch('/link-bank-transaction/$id', data: body);
    return LinkedBankTransactionModel.fromJson(res.data['data']);
  }

  /// 3.5. Xóa biến động số dư ngân hàng
  Future<void> deleteLinkedBankTransaction(String id) async {
    await _dio.delete('/link-bank-transaction/$id');
  }
}
```
