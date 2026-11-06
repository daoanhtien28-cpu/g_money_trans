# 💳 Tài Liệu Tích Hợp API Lịch Sử Giao Dịch (Transactions) Cho Front-End

- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Module:** `Transactions` (Chuyển khoản nội địa)

---

## 1. Bản Đồ Ánh Xạ UI Với Dữ Liệu Backend

Giao diện thực tế của một Item giao dịch trên Mobile:

```text
┌─────────────────────────────────────────────────────────────┐
│ 18:08:45 | 체크                                       출금  │
│ 자연애마트                                          9,470 원 │
│                                                잔액 2,686원 │
└─────────────────────────────────────────────────────────────┘
```

### Chi tiết ánh xạ từng vị trí trên UI:

| Vị trí trên UI | Dữ liệu trên UI mẫu | Tên trường Backend | Kiểu | Mô tả & Cách hiển thị |
| :--- | :--- | :--- | :---: | :--- |
| **Góc trên bên trái** | `18:08:45` | `transferTimeDetail` | `string` | Giờ phút giây giao dịch (`HH:mm:ss`) |
| **Góc trên bên trái** | `체크` | `transferTypeTag` | `string` | Loại hình: `'체크'` (thẻ check), `'이체'` (chuyển khoản), `'ATM'` |
| **Góc trên bên phải** | `출금` hoặc `입금` | `isDeposit` | `boolean` | `false` ➡️ hiển thị **출금** (Rút/Chuyển đi)<br>`true` ➡️ hiển thị **입금** (Nạp/Nhận vào) |
| **Dòng chính bên trái** | `자연애마트` | `title` | `string` | Tên người nhận, tên cửa hàng hoặc đơn vị giao dịch |
| **Dòng chính bên phải** | `9,470 원` | `transferAmount` | `number` | Số tiền giao dịch. Nếu `isDeposit == false` tô **màu đỏ/hồng** (`#D81B60`), nếu `true` tô **màu xanh** (`#4B6BC6`) |
| **Dòng phụ bên phải** | `잔액 2,686원` | `balanceAfter` | `number` | Số dư khả dụng của ví còn lại sau giao dịch (`잔액 <balanceAfter>원`) |

---

## 2. Cấu Trúc Dữ Liệu JSON Chuẩn (Transaction Schema)

```json
{
  "id": "6aab1fadc960c32a73b0dff8",
  "userId": "6aab0b0f15966c417d393007",
  "walletId": "6aab10de6e482147645f43c3",
  "transferNumber": "1128OTT260916001",
  "transferChannel": "Sh 수협",
  "transferTypeTag": "체크",
  "title": "자연애마트",
  "content": "식료품 구매",
  "isDeposit": false,
  "currency": "KRW",
  "transferAmount": 9470,
  "fee": 0,
  "balanceAfter": 2686,
  "totalWithdrawalAmount": 2686,
  "status": "SUCCESS",
  "paymentBank": {
    "bankCode": "SH",
    "name": "수협",
    "imageUrl": "assets/images/bank/bank_suhyup.png",
    "accountNumber": "1234 5678 9012",
    "accountName": "DAO ANH TIEN"
  },
  "beneficiaryBank": {
    "bankCode": "KB",
    "name": "국민은행",
    "imageUrl": "assets/images/bank/bank_kb.png",
    "accountNumber": "128-910734-43507",
    "accountName": "자연애마트"
  },
  "transferTime": "2026.09.16",
  "transferTimeDetail": "18:08:45",
  "createdAt": "2026-09-16T23:01:01.440Z",
  "updatedAt": "2026-09-18T04:19:25.000Z"
}
```

---

## 3. Danh Sách Endpoints Chi Tiết

### 3.1. Lấy danh sách giao dịch với bộ lọc (`GET /api/transactions`)

Hỗ trợ đầy đủ các bộ lọc từ **2 Bottom Sheet (조회조건 & 검색어 입력)** của App:

* **Endpoint:** `/api/transactions`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`

#### Các tham số lọc (Query Parameters):

| Tham số | Kiểu | Mặc định | Tương ứng trên Bottom Sheet App | Ví dụ |
| :--- | :---: | :---: | :--- | :--- |
| `type` | `enum` | `ALL` | **거래구분**: `ALL` (전체), `DEPOSIT` (입금), `WITHDRAWAL` (출금) | `?type=WITHDRAWAL` |
| `sortOrder` | `enum` | `NEWEST` | **정렬순서**: `NEWEST` (최신순 - mới nhất), `OLDEST` (과거순 - cũ nhất) | `?sortOrder=NEWEST` |
| `period` | `string` | - | **조회기간**: `1M` (1개월), `3M` (3개월), `6M` (6개월) | `?period=1M` |
| `startDate` | `string` | - | **직접입력**: Từ ngày (`YYYY.MM.DD` hoặc `YYYY-MM-DD`) | `?startDate=2026.08.01` |
| `endDate` | `string` | - | **직접입력**: Đến ngày (`YYYY.MM.DD` hoặc `YYYY-MM-DD`) | `?endDate=2026.09.16` |
| `searchType` | `enum` | `ALL` | **검색어 입력**: `HOLDER` (예금주명), `MEMO` (메모), `ALL` | `?searchType=HOLDER` |
| `keyword` | `string` | - | **검색어**: Từ khóa nhập vào ô input | `?keyword=자연애마트` |
| `minAmount` | `number` | - | **금액**: Số tiền tối thiểu (>= `transferAmount`) | `?minAmount=10000` |
| `maxAmount` | `number` | - | **금액**: Số tiền tối đa (<= `transferAmount`) | `?maxAmount=500000` |
| `page` | `number` | `1` | Phân trang | `?page=1` |
| `limit` | `number` | `20` | Số lượng item mỗi trang | `?limit=20` |

#### Ví dụ các URL lọc thực tế:
- Mặc định khi vào màn hình: `GET /api/transactions?period=1M&type=ALL&sortOrder=NEWEST`
- Chỉ lọc các giao dịch rút/chuyển tiền: `GET /api/transactions?type=WITHDRAWAL`
- Lọc theo khoảng số tiền từ 10,000 KRW đến 500,000 KRW: `GET /api/transactions?minAmount=10000&maxAmount=500000`
- Tìm kiếm theo tên người nhận là "자연애마트": `GET /api/transactions?searchType=HOLDER&keyword=자연애마트`
- Tìm kiếm theo ghi chú lời nhắn (memo): `GET /api/transactions?searchType=MEMO&keyword=식료품`

#### Response Thành Công (`200 OK`):
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "6aab1fadc960c32a73b0dff8",
        "transferNumber": "1128OTT260916001",
        "transferChannel": "Hana EZ",
        "transferTypeTag": "체크",
        "title": "자연애마트",
        "content": "식료품 구매",
        "isDeposit": false,
        "currency": "KRW",
        "transferAmount": 9470,
        "fee": 0,
        "balanceAfter": 2686,
        "totalWithdrawalAmount": 2686,
        "status": "SUCCESS",
        "transferTime": "2026.09.16",
        "transferTimeDetail": "18:08:45"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "timestamp": "2026-09-17T06:01:17.869Z"
}
```

---

### 3.2. Xem chi tiết giao dịch (`GET /api/transactions/:id`)

* **Endpoint:** `/api/transactions/:id`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`

---

### 3.3. Tạo mới giao dịch chuyển tiền (`POST /api/transactions`)

Tự động trừ/cộng tiền vào Ví của người dùng và cập nhật số dư `balanceAfter`.

* **Endpoint:** `/api/transactions`
* **Method:** `POST`
* **Headers:**
  * `Authorization: Bearer <accessToken>`
  * `Content-Type: application/json`

#### Request Body Mẫu:
```json
{
  "title": "자연애마트",
  "transferAmount": 9470,
  "isDeposit": false,
  "transferTypeTag": "체크",
  "receiverBankCode": "KB",
  "receiverAccountNumber": "128-910734-43507",
  "receiverName": "자연애마트",
  "content": "식료품 구매"
}
```

---

### 3.4. Chỉnh sửa tất cả thông tin giao dịch (`PATCH /api/transactions/:id`)

Hỗ trợ màn hình `EditTransactionDialog` của App để chỉnh sửa lại thông tin/số tiền.
Giao dịch cho phép chỉnh sửa **tất cả mọi trường thông tin**:
- `title`, `transferAmount`, `isDeposit`, `transferTypeTag`, `content` (메모)
- `transferTime`, `transferTimeDetail`, `receiverBankCode`, `receiverAccountNumber`, `receiverName`
- `status`, `transferChannel`, `transferNumber`, `paymentBank`, `beneficiaryBank`

#### ⚙️ Quy tắc tự động bù trừ số dư Ví thông minh:
Khi sửa số tiền (`transferAmount`) hoặc chiều giao dịch (`isDeposit`):
1. **Sửa tăng tiền ra (출금):**
   - Ví dụ: Số dư ví hiện tại = 10,000 KRW, giao dịch tiền ra cũ = 10,000 KRW.
   - Nếu sửa thành 30,000 KRW (cần trừ thêm 20,000 KRW mà ví chỉ có 10,000 KRW) ➡️ **Báo lỗi `400 Bad Request: Số dư ví không đủ...` (không cho sửa)**.
   - Nếu sửa thành 20,000 KRW (trừ thêm đúng 10,000 KRW) ➡️ **Cho phép sửa, số dư ví và `balanceAfter` về 0 KRW**.
2. **Sửa tăng tiền vào (입금):**
   - Ví dụ: Giao dịch tiền vào cũ = 10,000 KRW, sửa thành 30,000 KRW ➡️ **Ví tự động được cộng thêm 20,000 KRW**.
3. **Sửa giảm tiền ra / tiền vào:**
   - Sửa giảm tiền ra ➡️ Ví được hoàn lại phần chênh lệch.
   - Sửa giảm tiền vào ➡️ Ví bị trừ phần chênh lệch (nếu số dư ví hiện tại không đủ để trừ thì báo lỗi `400`).

* **Endpoint:** `/api/transactions/:id`
* **Method:** `PATCH`
* **Headers:**
  * `Authorization: Bearer <accessToken>`
  * `Content-Type: application/json`

#### Request Body Mẫu (Chỉ gửi các trường muốn đổi):
```json
{
  "title": "자연애마트",
  "transferAmount": 20000,
  "content": "Sửa lại giá tiền mua hàng"
}
```

> ⚠️ **Lưu ý nghiệp vụ:** Giao dịch trong hệ thống **không thể xóa** (không hỗ trợ API `DELETE`), đảm bảo toàn vẹn dữ liệu sao kê lịch sử tài khoản. Người dùng chỉ có quyền xem, tạo mới và chỉnh sửa thông tin giao dịch.

---

## 4. Code Mẫu Flutter (Dart) Tích Hợp

### 4.1. Model Class `TransactionItemModel`

```dart
class TransactionItemModel {
  final String id;
  final String transferNumber;
  final String transferChannel;
  final String transferTypeTag;
  final String title;
  final String content;
  final bool isDeposit;
  final String currency;
  final double transferAmount;
  final double fee;
  final double balanceAfter;
  final String status;
  final String transferTime;
  final String transferTimeDetail;

  TransactionItemModel({
    required this.id,
    required this.transferNumber,
    required this.transferChannel,
    required this.transferTypeTag,
    required this.title,
    required this.content,
    required this.isDeposit,
    required this.currency,
    required this.transferAmount,
    required this.fee,
    required this.balanceAfter,
    required this.status,
    required this.transferTime,
    required this.transferTimeDetail,
  });

  factory TransactionItemModel.fromJson(Map<String, dynamic> json) {
    return TransactionItemModel(
      id: json['id'] ?? json['_id'] ?? '',
      transferNumber: json['transferNumber'] ?? '',
      transferChannel: json['transferChannel'] ?? 'Hana EZ',
      transferTypeTag: json['transferTypeTag'] ?? (json['isDeposit'] == true ? '입금' : '체크'),
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      isDeposit: json['isDeposit'] == true,
      currency: json['currency'] ?? 'KRW',
      transferAmount: (json['transferAmount'] as num?)?.toDouble() ?? 0.0,
      fee: (json['fee'] as num?)?.toDouble() ?? 0.0,
      balanceAfter: (json['balanceAfter'] as num?)?.toDouble() ??
          (json['totalWithdrawalAmount'] as num?)?.toDouble() ??
          0.0,
      status: json['status'] ?? 'SUCCESS',
      transferTime: json['transferTime'] ?? '',
      transferTimeDetail: json['transferTimeDetail'] ?? '',
    );
  }
}
```

### 4.2. Widget Render Item Chuẩn Theo Giao Diện Ảnh Chụp

```dart
Widget buildTransactionCard(TransactionItemModel item) {
  final formatCurrency = NumberFormat('#,###');
  final amountText = '${formatCurrency.format(item.transferAmount)} 원';
  final balanceText = '잔액 ${formatCurrency.format(item.balanceAfter)}원';
  final isDeposit = item.isDeposit;

  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    decoration: const BoxDecoration(
      border: Border(bottom: BorderSide(color: Color(0xFFEFEFEF), width: 1)),
    ),
    child: Column(
      children: [
        // Dòng trên: Giờ | Tag loại ........... Trạng thái (출금 / 입금)
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${item.transferTimeDetail} | ${item.transferTypeTag}',
              style: const TextStyle(fontSize: 13, color: Color(0xFF9E9E9E)),
            ),
            Text(
              isDeposit ? '입금' : '출금',
              style: const TextStyle(fontSize: 13, color: Color(0xFF757575)),
            ),
          ],
        ),
        const SizedBox(height: 6),
        // Dòng chính: Tiêu đề ........... Số tiền giao dịch
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              item.title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF212121),
              ),
            ),
            Text(
              amountText,
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
                color: isDeposit ? const Color(0xFF4B6BC6) : const Color(0xFFD81B60),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        // Dòng dưới: Số dư còn lại (잔액)
        Align(
          alignment: Alignment.centerRight,
          child: Text(
            balanceText,
            style: const TextStyle(fontSize: 13, color: Color(0xFF616161)),
          ),
        ),
      ],
    ),
  );
}
```
