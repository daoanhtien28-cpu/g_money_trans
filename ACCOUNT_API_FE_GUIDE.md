# 💳 Tài Liệu Tích Hợp API Thông Tin Tài Khoản (Account Overview) Cho Front-End (Web & Mobile)

- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Module:** `Accounts` (Hỗ trợ song song cả 2 prefix: `/api/accounts` và `/api/wallets`)

---

## 1. Nguyên Tắc Hoạt Động (Business Logic)

Màn hình **Account Information (Thông tin tài khoản)** chia làm **3 phân hệ tài khoản rõ rệt**:

1. **`gmoneyPay` (Chỉ có 1 tài khoản duy nhất - Không phải List):**
   - Tài khoản thanh toán nội bộ của Gmoney.
   - Các hành động: Nạp tiền (`TOP_UP`), Chuyển tiền nội địa (`DOMESTIC_TRANSFER`), Chuyển tiền quốc tế (`OVERSEAS_TRANSFER`), Rút tiền ATM (`ATM_WITHDRAW`).
2. **`gmoneyWallet` (Chỉ có 1 ví duy nhất - Không phải List):**
   - Ví điện tử nội bộ mang mã số riêng.
   - Các hành động: Nạp tiền (`TOP_UP`), Chuyển tiền nội địa (`DOMESTIC_TRANSFER`), Lịch sử giao dịch (`TRANSACTION_HISTORY`), Rút tiền ATM (`ATM_WITHDRAW`).
3. **`linkedBankAccounts` (Danh sách các tài khoản ngân hàng liên kết ngoài - Là 1 List):**
   - Các ngân hàng thương mại bên ngoài (ví dụ: `Shinhan Bank`, `NH Bank`, `KB`...).
   - **`isPrimary: true`**: Đánh dấu tài khoản chính (hiển thị badge màu xanh **Main** như trong giao diện UI).
   - Có thời gian đồng bộ số dư `lastSyncedAt`.
   - **Khi người dùng mới đăng ký:** Danh sách này mặc định **RỖNG (`[]`)**, người dùng chưa liên kết ngân hàng nào.
   - **Số dư mặc định ban đầu:** Mọi số dư (`gmoneyPay`, `gmoneyWallet`) đều bằng **0 KRW**.

---

## 2. API Lấy Toàn Bộ Thông Tin Tài Khoản (`GET /api/wallets` hoặc `GET /api/wallets/overview`)

* **Endpoint:** `/api/wallets` (hoặc `/api/wallets/overview`)
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`

### Response Chuẩn (`200 OK`):

```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "gmoneyPay": {
      "id": "b1111111-9c0b-4ef8-bb6d-6bb9bd380a11",
      "accountNumber": "GMP-KRW-882910",
      "balance": 1250000.00,
      "currency": "KRW",
      "status": "ACTIVE",
      "availableActions": ["TOP_UP", "DOMESTIC_TRANSFER", "OVERSEAS_TRANSFER", "ATM_WITHDRAW"]
    },
    "gmoneyWallet": {
      "id": "b2222222-9c0b-4ef8-bb6d-6bb9bd380a11",
      "accountNumber": "GMW-KRW-550192",
      "balance": 500000.00,
      "currency": "KRW",
      "status": "ACTIVE",
      "availableActions": ["TOP_UP", "DOMESTIC_TRANSFER", "TRANSACTION_HISTORY", "ATM_WITHDRAW"]
    },
    "linkedBankAccounts": [
      {
        "id": "c1111111-9c0b-4ef8-bb6d-6bb9bd380a11",
        "bankCode": "SHINHAN",
        "bankName": "Shinhan Bank",
        "accountNumberMasked": "110614025931",
        "balance": 306901.00,
        "currency": "KRW",
        "isPrimary": true,
        "status": "ACTIVE",
        "imageUrl": "assets/images/bank/bank_shinhan.png",
        "lastSyncedAt": "2026-10-12T15:50:00.000Z",
        "availableActions": ["TOP_UP_TO_PAY", "UNLINK"]
      },
      {
        "id": "c2222222-9c0b-4ef8-bb6d-6bb9bd380a11",
        "bankCode": "NH",
        "bankName": "NH Bank",
        "accountNumberMasked": "3517627352193",
        "balance": 2500309.00,
        "currency": "KRW",
        "isPrimary": false,
        "status": "ACTIVE",
        "imageUrl": "assets/images/bank/bank_nh.png",
        "lastSyncedAt": "2026-10-12T15:00:00.000Z",
        "availableActions": ["SET_PRIMARY", "TOP_UP_TO_PAY", "UNLINK"]
      }
    ]
  },
  "timestamp": "2026-10-12T16:00:00.000Z"
}
```

---

## 3. Các API Thao Tác Bổ Trợ

### 3.1. Nút "Liên kết tài khoản ngân hàng" (`POST /api/wallets`)

Dùng để thêm tài khoản ngân hàng mới vào danh sách `linkedBankAccounts`.

* **Endpoint:** `/api/wallets`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`

```json
{
  "linkedBankCode": "NH",
  "accountNumber": "3517627352193",
  "ownerName": "DAO ANH TIEN",
  "availableBalance": 2500309,
  "isMain": false
}
```

---

### 3.2. Menu 3 chấm ➔ Đặt làm tài khoản chính (`PATCH /api/wallets/:id/main`)

Chuyển đổi một ngân hàng liên kết thành `isPrimary: true` (các ngân hàng khác tự động chuyển về `false`).

* **Endpoint:** `/api/wallets/:id/main`
* **Method:** `PATCH`
* **Headers:** `Authorization: Bearer <accessToken>`

---

### 3.3. Menu 3 chấm ➔ Hủy liên kết tài khoản (`DELETE /api/wallets/:id`)

Hủy liên kết tài khoản ngân hàng khỏi danh sách `linkedBankAccounts`.

* **Endpoint:** `/api/wallets/:id`
* **Method:** `DELETE`
* **Headers:** `Authorization: Bearer <accessToken>`

---

### 3.4. Kéo để làm mới ➔ Đồng bộ số dư ngân hàng (`POST /api/wallets/:id/sync`)

* **Endpoint:** `/api/wallets/:id/sync`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`

---

### 3.5. Reset tài khoản về mặc định (`POST /api/wallets/reset` hoặc `POST /api/accounts/reset`)

Dùng trong môi trường phát triển / kiểm thử để đưa tài khoản về trạng thái ban đầu:
- Tiền trong `gmoneyPay`, `gmoneyWallet` và `totalBalance` về **0 KRW**.
- Xóa toàn bộ tài khoản ngân hàng trong `linkedBankAccounts` (trả về mảng rỗng `[]`).

* **Endpoint:** `/api/wallets/reset` (hoặc `/api/accounts/reset`)
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <accessToken>`

---

## 4. Code Mẫu Tích Hợp Flutter (Dart)

### 4.1. Models

```dart
class AccountOverviewData {
  final AccountItemModel gmoneyPay;
  final AccountItemModel gmoneyWallet;
  final List<LinkedBankModel> linkedBankAccounts;

  AccountOverviewData({
    required this.gmoneyPay,
    required this.gmoneyWallet,
    required this.linkedBankAccounts,
  });

  factory AccountOverviewData.fromJson(Map<String, dynamic> json) {
    return AccountOverviewData(
      gmoneyPay: AccountItemModel.fromJson(json['gmoneyPay'] ?? {}),
      gmoneyWallet: AccountItemModel.fromJson(json['gmoneyWallet'] ?? {}),
      linkedBankAccounts: (json['linkedBankAccounts'] as List? ?? [])
          .map((e) => LinkedBankModel.fromJson(e))
          .toList(),
    );
  }
}

class AccountItemModel {
  final String id;
  final String accountNumber;
  final double balance;
  final String currency;
  final String status;
  final List<String> availableActions;

  AccountItemModel({
    required this.id,
    required this.accountNumber,
    required this.balance,
    required this.currency,
    required this.status,
    required this.availableActions,
  });

  factory AccountItemModel.fromJson(Map<String, dynamic> json) {
    return AccountItemModel(
      id: json['id'] ?? '',
      accountNumber: json['accountNumber'] ?? '',
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'KRW',
      status: json['status'] ?? 'ACTIVE',
      availableActions: List<String>.from(json['availableActions'] ?? []),
    );
  }
}

class LinkedBankModel {
  final String id;
  final String bankCode;
  final String bankName;
  final String accountNumberMasked;
  final double balance;
  final String currency;
  final bool isPrimary;
  final String status;
  final String imageUrl;
  final DateTime lastSyncedAt;
  final List<String> availableActions;

  LinkedBankModel({
    required this.id,
    required this.bankCode,
    required this.bankName,
    required this.accountNumberMasked,
    required this.balance,
    required this.currency,
    required this.isPrimary,
    required this.status,
    required this.imageUrl,
    required this.lastSyncedAt,
    required this.availableActions,
  });

  factory LinkedBankModel.fromJson(Map<String, dynamic> json) {
    return LinkedBankModel(
      id: json['id'] ?? '',
      bankCode: json['bankCode'] ?? '',
      bankName: json['bankName'] ?? '',
      accountNumberMasked: json['accountNumberMasked'] ?? '',
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] ?? 'KRW',
      isPrimary: json['isPrimary'] ?? json['isMain'] ?? false,
      status: json['status'] ?? 'ACTIVE',
      imageUrl: json['imageUrl'] ?? '',
      lastSyncedAt: DateTime.tryParse(json['lastSyncedAt'] ?? '') ?? DateTime.now(),
      availableActions: List<String>.from(json['availableActions'] ?? []),
    );
  }
}
```

### 4.2. API Service

```dart
import 'package:dio/dio.dart';

class AccountService {
  final Dio _dio;

  AccountService(this._dio);

  /// Lấy toàn bộ dữ liệu màn hình Account Information
  Future<AccountOverviewData> getAccountOverview() async {
    try {
      final response = await _dio.get('/wallets');
      if (response.data['success'] == true) {
        return AccountOverviewData.fromJson(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Lỗi tải dữ liệu tài khoản');
    } catch (e) {
      rethrow;
    }
  }

  /// Đặt ngân hàng làm tài khoản chính
  Future<void> setPrimaryBank(String id) async {
    await _dio.patch('/wallets/$id/main');
  }

  /// Hủy liên kết ngân hàng
  Future<void> unlinkBank(String id) async {
    await _dio.delete('/wallets/$id');
  }

  /// Đồng bộ số dư ngân hàng
  Future<void> syncBankBalance(String id) async {
    await _dio.post('/wallets/$id/sync');
  }
}
```
