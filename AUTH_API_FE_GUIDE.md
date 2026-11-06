# 📖 Tài Liệu Tích Hợp API Auth Cho Front-End (Web & Mobile)

- **Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`

---

## 1. Quy ước Mật khẩu (Password Requirements)

* **Kiểu dữ liệu:** Chuỗi ký tự (`string`).
* **Quy tắc bảo mật:**
  * Độ dài: **Đúng 6 chữ số** (chỉ bao gồm các ký tự số từ `0` đến `9`, regex: `^\d{6}$`).
* **Ví dụ mẫu hợp lệ:** `"123456"`, `"654321"`, `"098765"`

---

## 2. Chi Tiết Các Endpoints

### 2.1. Đăng ký tài khoản (`POST /api/auth/register`)

Tạo tài khoản người dùng mới bằng Email, Mật khẩu và Tên. Tự động cấp cặp token, đồng thời **tự động khởi tạo luôn ví mặc định** cho tài khoản.

> **Lưu ý:** Đăng ký chỉ cần `email`, `password` và `fullName` (Tên). Trường `cardNumber` là tùy chọn (nếu không truyền, hệ thống sẽ tự động sinh số thẻ ngẫu nhiên).

* **Endpoint:** `/api/auth/register`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "123456",
  "fullName": "DAO ANH TIEN"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Có** | Email đăng ký (dùng để đăng nhập) |
| `password` | `string` | **Có** | Mật khẩu (gồm đúng 6 chữ số) |
| `fullName` | `string` | **Có** | Họ tên người dùng |
| `cardNumber` | `string` | Không | Số thẻ ngân hàng (tùy chọn, hệ thống tự động sinh nếu không truyền) |

#### Response Thành Công (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  },
  "timestamp": "2026-09-17T02:35:53.997Z"
}
```

#### Response Thất Bại
* **`400 Bad Request`**: Dữ liệu gửi lên không đúng định dạng hoặc không thỏa mãn yêu cầu mật khẩu:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": [
      "Mật khẩu phải gồm đúng 6 chữ số"
    ],
    "timestamp": "2026-09-17T02:36:00.000Z",
    "path": "/api/auth/register"
  }
  ```
* **`409 Conflict`**: Email đã được đăng ký:
  ```json
  {
    "success": false,
    "statusCode": 409,
    "message": "Email đã được sử dụng",
    "timestamp": "2026-09-17T02:36:00.000Z",
    "path": "/api/auth/register"
  }
  ```

---

### 2.2. Đăng nhập (`POST /api/auth/login`)

Xác thực bằng **Email** và **Mật khẩu** để nhận Token.

* **Endpoint:** `/api/auth/login`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Có** | Email tài khoản đã đăng ký |
| `password` | `string` | **Có** | Mật khẩu (gồm đúng 6 chữ số) |
| `cardNumber` | `string` | Không | Số thẻ ngân hàng (hỗ trợ tùy chọn) |

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  },
  "timestamp": "2026-09-17T02:36:11.107Z"
}
```

#### Response Thất Bại
* **`401 Unauthorized`**: Sai email hoặc sai mật khẩu:
  ```json
  {
    "success": false,
    "statusCode": 401,
    "message": "Email hoặc mật khẩu không đúng",
    "timestamp": "2026-09-17T02:36:34.338Z",
    "path": "/api/auth/login"
  }
  ```

---

### 2.3. Lấy thông tin tài khoản hiện tại (`GET /api/auth/me`)

* **Endpoint:** `/api/auth/me`
* **Method:** `GET`
* **Headers:**
  * `Authorization: Bearer <accessToken>`

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6aaef99de099f80722ad6e0",
    "cardNumber": "9704123456789012",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "isActive": true,
    "createdAt": "2026-09-17T02:35:53.997Z",
    "updatedAt": "2026-09-17T02:36:11.107Z"
  },
  "timestamp": "2026-09-17T02:37:00.000Z"
}
```


---

### 2.4. Làm mới Token (`POST /api/auth/refresh`)

Khi `accessToken` hết hạn (mặc định sau 30 ngày), FE gọi API này để lấy accessToken mới bằng `refreshToken`.

* **Endpoint:** `/api/auth/refresh`
* **Method:** `POST`
* **Headers:**
  * `Authorization: Bearer <refreshToken>`
  * `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "refreshToken": "<refreshToken_hien_tai>"
  }
  ```

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "accessToken": "<new_accessToken>",
    "refreshToken": "<new_refreshToken>"
  },
  "timestamp": "2026-09-17T02:38:00.000Z"
}
```

---

### 2.5. Đăng xuất (`POST /api/auth/logout`)

Vô hiệu hoá refresh token trong cơ sở dữ liệu.

* **Endpoint:** `/api/auth/logout`
* **Method:** `POST`
* **Headers:**
  * `Authorization: Bearer <accessToken>`

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Đăng xuất thành công"
  }
}
```

---

### 2.6. Cập nhật thông tin người dùng (`PATCH /api/users/profile`)

Cho phép người dùng cập nhật thông tin cá nhân (ví dụ: họ tên).

* **Endpoint:** `/api/users/profile`
* **Method:** `PATCH`
* **Headers:**
  * `Authorization: Bearer <accessToken>`
  * `Content-Type: application/json`

#### Request Body
```json
{
  "fullName": "Nguyễn Văn B"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `fullName` | `string` | Không | Họ tên mới cần cập nhật (tối đa 100 ký tự) |

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6aaef99de099f80722ad6e0",
    "cardNumber": "9704123456789012",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn B",

    "isActive": true,
    "createdAt": "2026-09-17T02:35:53.997Z",
    "updatedAt": "2026-09-17T03:22:00.000Z"
  },
  "timestamp": "2026-09-17T03:22:00.000Z"
}
```

---

### 2.7. Đổi mật khẩu (`PATCH /api/users/change-password`)

Yêu cầu người dùng nhập mật khẩu hiện tại và mật khẩu mới.

* **Endpoint:** `/api/users/change-password`
* **Method:** `PATCH`
* **Headers:**
  * `Authorization: Bearer <accessToken>`
  * `Content-Type: application/json`

#### Request Body
```json
{
  "currentPassword": "123456",
  "newPassword": "654321"
}
```

| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `currentPassword` | `string` | **Có** | Mật khẩu hiện tại (6 chữ số) |
| `newPassword` | `string` | **Có** | Mật khẩu mới (gồm đúng 6 chữ số) |

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "message": "Đổi mật khẩu thành công"
  }
}
```

#### Response Thất Bại Thường Gặp
* **`400 Bad Request`**: Mật khẩu hiện tại sai hoặc mật khẩu mới trùng với mật khẩu cũ:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Mật khẩu hiện tại không chính xác",
    "timestamp": "2026-09-17T03:23:00.000Z",
    "path": "/api/users/change-password"
  }
  ```
  hoặc:
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Mật khẩu mới không được trùng với mật khẩu cũ",
    "timestamp": "2026-09-17T03:23:00.000Z",
    "path": "/api/users/change-password"
  }
  ```

---

## 3. Danh Sách Endpoints Quản Lý Tài Khoản & Ví (Accounts / Wallets)

> 💡 **Tài liệu chi tiết cấu trúc tài khoản mới:** Xem chi tiết đầy đủ tại [ACCOUNT_API_FE_GUIDE.md](./ACCOUNT_API_FE_GUIDE.md) hoặc [WALLET_API_FE_GUIDE.md](./WALLET_API_FE_GUIDE.md).
> Hệ thống hiện tại đã cập nhật mô hình **Account Overview**: bao gồm `summary`, `gmoneyPay`, `gmoneyWallet` và danh sách các ngân hàng liên kết `linkedBankAccounts`.

> **Mô hình 1 User = 1 Ví cố định:**
> - **Tự động tạo:** Ví được hệ thống **tự động khởi tạo ngay khi người dùng đăng ký tài khoản** (hoặc tự động tạo ví mặc định khi gọi `GET /api/wallets` lần đầu nếu chưa có).
> - **Không thể xóa ví:** Không hỗ trợ API xoá ví (`DELETE`), mỗi tài khoản luôn gắn liền với ví của mình.
> - **Không thể tự tạo ví:** Không có API tạo ví thủ công (`POST`), tài khoản chỉ có duy nhất 1 ví.
> - **Không cần `walletId`:** FE chỉ cần truyền `accessToken`, Backend tự xác định ví của user.

* **Yêu cầu Headers cho tất cả API Ví:**
  * `Authorization: Bearer <accessToken>`

---

### 3.1. Lấy thông tin ví của người dùng (`GET /api/wallets`)

Trả về trực tiếp đối tượng ví duy nhất của người dùng hiện tại (không bọc trong mảng, không cần ID).

* **Endpoint:** `/api/wallets`
* **Method:** `GET`
* **Headers:** `Authorization: Bearer <accessToken>`

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6aab18917ec355abc1f45666",
    "userId": "6aab18917ec355abc1f45665",
    "accountNumber": "1234 5678 9012",
    "ownerName": "DAO ANH TIEN",
    "currency": "KRW",
    "availableBalance": 125500000,
    "availableBalanceEdit": 125500000,
    "totalBalance": 130000000,
    "frozenBalance": 4500000,
    "walletType": "PERSONAL",
    "status": "ACTIVE",
    "linkedBankName": "HanaBank",
    "linkedBankAccount": "0901 234 567",
    "imageUrl": "assets/images/hana_bank.png",
    "createdAt": "2026-09-17T05:30:41.572Z",
    "updatedAt": "2026-09-17T05:30:41.572Z"
  },
  "timestamp": "2026-09-17T05:30:46.713Z"
}
```

---

### 3.2. Cập nhật ví / Số dư ví (`PATCH /api/wallets`)

Cập nhật trực tiếp ví của người dùng đang đăng nhập mà **không cần truyền `walletId`**.

Dùng để cập nhật số dư hiển thị (`availableBalanceEdit`), số dư thực tế, hoặc tài khoản ngân hàng liên kết:

* **Endpoint:** `/api/wallets`
* **Method:** `PATCH`
* **Headers:**
  * `Authorization: Bearer <accessToken>`
  * `Content-Type: application/json`

#### Request Body (Các trường đều tùy chọn)
```json
{
  "availableBalanceEdit": 250000000,
  "availableBalance": 250000000,
  "totalBalance": 254500000,
  "linkedBankName": "ShinhanBank",
  "linkedBankAccount": "0901 234 567"
}
```

#### Response Thành Công (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": "6aab18917ec355abc1f45666",
    "userId": "6aab18917ec355abc1f45665",
    "accountNumber": "1234 5678 9012",
    "ownerName": "DAO ANH TIEN",
    "currency": "KRW",
    "availableBalance": 250000000,
    "availableBalanceEdit": 250000000,
    "totalBalance": 254500000,
    "frozenBalance": 4500000,
    "walletType": "PERSONAL",
    "status": "ACTIVE",
    "linkedBankName": "ShinhanBank",
    "linkedBankAccount": "0901 234 567",
    "imageUrl": "assets/images/hana_bank.png",
    "createdAt": "2026-09-17T05:30:41.572Z",
    "updatedAt": "2026-09-17T05:30:46.810Z"
  },
  "timestamp": "2026-09-17T05:30:46.859Z"
}
```

---

## 4. Hướng Dẫn Tích Hợp Cho Front-End (Flutter / Mobile)

### 4.1. Lưu trữ Token an toàn

* Sử dụng thư viện bảo mật như `flutter_secure_storage` (Flutter), tránh lưu plain-text trong `SharedPreferences` hoặc `localStorage`.

### 3.2. Cấu hình Dio / Axios Interceptor
Gắn `accessToken` vào Header của mỗi Request:
```dart
dio.interceptors.add(
  InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await secureStorage.read(key: 'accessToken');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
    onError: (DioException error, handler) async {
      if (error.response?.statusCode == 401) {
        // Tự động refresh token
        final refreshToken = await secureStorage.read(key: 'refreshToken');
        if (refreshToken != null) {
          try {
            final res = await dio.post(
              '/auth/refresh',
              options: Options(headers: {'Authorization': 'Bearer $refreshToken'}),
              data: {'refreshToken': refreshToken},
            );
            final newAccessToken = res.data['data']['accessToken'];
            final newRefreshToken = res.data['data']['refreshToken'];
            await secureStorage.write(key: 'accessToken', value: newAccessToken);
            await secureStorage.write(key: 'refreshToken', value: newRefreshToken);

            // Thử lại request cũ với accessToken mới
            error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
            return handler.resolve(await dio.fetch(error.requestOptions));
          } catch (_) {
            // Refresh thất bại -> Điều hướng về màn hình Login vẽ hình
          }
        }
      }
      return handler.next(error);
    },
  ),
);
```
