# 🏦 Tài Liệu Tích Hợp API Ngân Hàng (Bank Master Data) Cho Front-End

- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`
- **Module:** `Banks`

---

## 1. Thiết Kế Cơ Sở Dữ Liệu Ngân Hàng (`banks` Collection)

Bảng **Bank** được thiết kế chuẩn theo mô hình **Master Data** của hệ thống Fintech/Banking:
- **Chỉ chứa thông tin chuẩn của chính ngân hàng** (Mã code, Tên ngân hàng, Tên viết tắt, Mã định danh Bank Code / BIN, Icon/Logo, Màu sắc đại diện, Thứ tự hiển thị).
- **Không lẫn lộn với tài khoản cá nhân:** Bỏ hoàn toàn các trường cá nhân `accountNumber`, `accountName` khỏi bảng danh mục ngân hàng.
- **Loại bỏ Securities:** Chỉ tập trung vào danh mục các Ngân hàng (`Banks`).

### 1.1. Cấu Trúc Đối Tượng Bank (JSON Schema)

```json
{
  "id": "6aab1ccfb1f2be89ec5c6c18",
  "code": "SH",
  "name": "수협",
  "shortName": "수협",
  "binCode": "007",
  "imageUrl": "assets/images/bank/bank_suhyup.png",
  "color": "#005596",
  "order": 1,
  "isActive": true,
  "createdAt": "2026-09-16T22:48:47.610Z",
  "updatedAt": "2026-09-18T04:19:25.000Z"
}
```

### 1.2. Bảng Giải Thích Chi Tiết Các Trường:

| Trường | Kiểu dữ liệu | Mô tả | Ví dụ |
| :--- | :--- | :--- | :--- |
| `id` | `string` | ID định danh MongoDB | `"6aab1ccfb1f2be89ec5c6c18"` |
| `code` | `string` | Mã định danh chuẩn (viết hoa, không đổi) | `"SH"`, `"HANA"`, `"KB"`, `"SHINHAN"` |
| `name` | `string` | Tên đầy đủ của ngân hàng (tiếng Hàn) | `"수협"`, `"하나은행"`, `"국민은행"` |
| `shortName` | `string` | Tên viết tắt hiển thị gọn gàng trên UI | `"수협"`, `"하나"`, `"국민"` |
| `binCode` | `string` | Mã ngân hàng (Bank Code / BIN chuẩn Hàn Quốc) | `"007"`, `"081"`, `"004"`, `"088"` |
| `imageUrl` | `string` | Đường dẫn asset logo ngân hàng chuẩn snake_case | `"assets/images/bank/bank_suhyup.png"` |
| `color` | `string` | Mã màu HEX thương hiệu đặc trưng của ngân hàng | `"#005596"` (SH), `"#008485"` (Hana) |
| `order` | `number` | Thứ tự ưu tiên sắp xếp trên màn hình (tăng dần) | `1, 2, 3...` |
| `isActive` | `boolean` | Trạng thái ngân hàng có hoạt động hay không | `true` |

---

## 2. Danh Sách Endpoints

### 2.1. Lấy danh sách tất cả các ngân hàng (`GET /api/banks`)

Dùng để render Bottom Sheet hoặc danh sách chọn ngân hàng (chuyển tiền, liên kết ví, tìm kiếm ngân hàng...). Dữ liệu được backend tự động sắp xếp theo `order ASC` (ngân hàng chính Sh 수협 đứng đầu).

* **Endpoint:** `/api/banks`
* **Method:** `GET`
* **Headers:** Không yêu cầu xác thực (Public API)

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "id": "6aab1ccfb1f2be89ec5c6c18",
      "code": "SH",
      "name": "수협",
      "shortName": "수협",
      "binCode": "007",
      "imageUrl": "assets/images/bank/bank_suhyup.png",
      "color": "#005596",
      "order": 1,
      "isActive": true
    },
    {
      "id": "6aab1ccfb1f2be89ec5c6c0b",
      "code": "HANA",
      "name": "하나은행",
      "shortName": "하나",
      "binCode": "081",
      "imageUrl": "assets/images/bank/bank_hana.png",
      "color": "#008485",
      "order": 2,
      "isActive": true
    },
    {
      "id": "6aab1ccfb1f2be89ec5c6c0c",
      "code": "KB",
      "name": "국민은행",
      "shortName": "국민",
      "binCode": "004",
      "imageUrl": "assets/images/bank/bank_kb.png",
      "color": "#FFBC00",
      "order": 3,
      "isActive": true
    }
  ],
  "timestamp": "2026-09-18T04:19:25.000Z"
}
```

---

### 2.2. Lấy chi tiết ngân hàng theo mã code (`GET /api/banks/code/:code`)

* **Endpoint:** `/api/banks/code/:code`
* **Method:** `GET`
* **Ví dụ:** `/api/banks/code/HANA` hoặc `/api/banks/code/SHINHAN`

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6aab1ccfb1f2be89ec5c6c0b",
    "code": "HANA",
    "name": "Hana Bank",
    "shortName": "Hana",
    "binCode": "081",
    "imageUrl": "assets/images/hana_bank.png",
    "color": "#008485",
    "order": 1,
    "isActive": true,
    "createdAt": "2026-09-16T22:48:47.610Z",
    "updatedAt": "2026-09-16T22:48:47.610Z"
  },
  "timestamp": "2026-09-17T05:49:23.878Z"
}
```

---

### 2.3. Lấy chi tiết ngân hàng theo ID (`GET /api/banks/:id`)

* **Endpoint:** `/api/banks/:id`
* **Method:** `GET`
* **Ví dụ:** `/api/banks/6aab1ccfb1f2be89ec5c6c0b`

---

## 3. Danh Sách Ngân Hàng Đã Được Tự Động Seed Vào Hệ Thống

| Order | Mã Code | Tên Ngân Hàng | Tên Viết Tắt | BIN Code | Mã Màu | Logo Asset |
| :---: | :--- | :--- | :--- | :---: | :---: | :--- |
| **1** | `HANA` | Hana Bank | Hana | 081 | `#008485` | `assets/images/hana_bank.png` |
| **2** | `KB` | Kookmin Bank | KB | 004 | `#FFBC00` | `assets/images/kb_bank.png` |
| **3** | `SHINHAN` | Shinhan Bank | Shinhan | 088 | `#0046FF` | `assets/images/shinhan_bank.png` |
| **4** | `WOORI` | Woori Bank | Woori | 020 | `#0067AC` | `assets/images/woori_bank.jpg` |
| **5** | `KAKAO` | Kakao Bank | Kakao | 090 | `#FEE500` | `assets/images/kakaobank.png` |
| **6** | `TOSS` | Toss Bank | Toss | 092 | `#0064FF` | `assets/images/toss_bank.png` |
| **7** | `NH` | NH Bank | NH | 011 | `#00A062` | `assets/images/nh_bank.jpg` |
| **8** | `IBK` | IBK | IBK | 003 | `#1A4B9C` | `assets/images/ibk_bank.png` |
| **9** | `SC` | SC Bank | SC | 023 | `#00A3E0` | `assets/images/standard_chartered_bank.png` |
| **10** | `DGB` | DGB Daegu Bank | DGB | 031 | `#0077C8` | `assets/images/DGB_bank.png` |
| **11** | `BUSAN` | BNK Busan Bank | Busan | 032 | `#E30613` | `assets/images/BNK_bank.png` |
| **12** | `KWANGJU` | Kwangju Bank | Kwangju | 034 | `#003882` | `assets/images/Kwangju_bank.png` |
| **13** | `JEONBUK` | Jeonbuk Bank | Jeonbuk | 037 | `#004B9B` | `assets/images/Jeonbuk_bank.png` |
| **14** | `SUHYUP` | Suhyup Bank | Suhyup | 007 | `#005596` | `assets/images/Suhyup_Bank.jpeg` |
| **15** | `CITI` | Citibank Korea | Citibank | 027 | `#002D72` | `assets/images/Citibank_Korea.png` |
| **16** | `POST` | Korea Post bank | Post | 071 | `#ED1C24` | `assets/images/kpost_bank.png` |
| **17** | `KFCC` | 새마을금고 | Saemaeul | 045 | `#005DAA` | `assets/images/새마을금고_bank.png` |
| **18** | `KMSFC` | KMSFC | KMSFC | 048 | `#003366` | `assets/images/kms_bank.jpg` |

---

## 4. Code Mẫu Flutter (Dart) Tích Hợp

### 4.1. Model Class `BankItemModel`

```dart
class BankItemModel {
  final String id;
  final String code;
  final String name;
  final String shortName;
  final String binCode;
  final String imageUrl;
  final String color;
  final int order;
  final bool isActive;

  BankItemModel({
    required this.id,
    required this.code,
    required this.name,
    required this.shortName,
    required this.binCode,
    required this.imageUrl,
    required this.color,
    required this.order,
    this.isActive = true,
  });

  factory BankItemModel.fromJson(Map<String, dynamic> json) {
    return BankItemModel(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      shortName: json['shortName'] ?? '',
      binCode: json['binCode'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      color: json['color'] ?? '#008485',
      order: json['order'] ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'shortName': shortName,
      'binCode': binCode,
      'imageUrl': imageUrl,
      'color': color,
      'order': order,
      'isActive': isActive,
    };
  }
}
```

### 4.2. Bank API Service (`bank_api_service.dart`)

```dart
import 'package:dio/dio.dart';

class BankApiService {
  final Dio _dio;

  BankApiService(this._dio);

  /// Lấy toàn bộ danh sách ngân hàng sắp xếp theo thứ tự ưu tiên
  Future<List<BankItemModel>> getAllBanks() async {
    try {
      final response = await _dio.get('/banks');
      if (response.data['success'] == true) {
        final List list = response.data['data'] ?? [];
        return list.map((item) => BankItemModel.fromJson(item)).toList();
      }
      throw Exception(response.data['message'] ?? 'Không thể tải danh sách ngân hàng');
    } catch (e) {
      rethrow;
    }
  }

  /// Lấy thông tin ngân hàng theo mã code (vd: 'HANA', 'KB'...)
  Future<BankItemModel> getBankByCode(String code) async {
    try {
      final response = await _dio.get('/banks/code/$code');
      if (response.data['success'] == true) {
        return BankItemModel.fromJson(response.data['data']);
      }
      throw Exception(response.data['message'] ?? 'Không tìm thấy ngân hàng');
    } catch (e) {
      rethrow;
    }
  }
}
```
