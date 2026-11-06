# 🏦 Bảng Quy Đổi Tên File Logo Ngân Hàng (Bank Logo Mapping)

Tài liệu này ghi lại chi tiết toàn bộ việc chuyển đổi tên file logo ngân hàng trong thư mục `assets/images/bank/` từ **tiếng Hàn** sang **tiếng Anh chuẩn (snake_case)** nhằm đảm bảo tính tương thích hệ thống, tránh lỗi mã hóa Unicode (NFC/NFD) trên iOS/Android/Git, và hỗ trợ Flutter code generator (`flutter_gen`).

---

## 1. Bảng Đối Chiếu Chi Tiết (Full Mapping Table - 35 Ngân Hàng & Tổ Chức)

| STT | Tên File Gốc (Tiếng Hàn) | Tên File Mới (Tiếng Anh) | Mã Code | Tên Tiếng Hàn | Tên Tiếng Anh | Tên / Ý Nghĩa Tiếng Việt | Đường Dẫn Mới (Asset Path) |
| :---: | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **1** | `하나은행.png` | `bank_hana.png` | `HANA` | 하나은행 | Hana Bank | Ngân hàng KEB Hana | `assets/images/bank/bank_hana.png` |
| **2** | `국민은행.png` | `bank_kb.png` | `KB` | 국민은행 | KB Kookmin Bank | Ngân hàng Quốc Dân Kookmin | `assets/images/bank/bank_kb.png` |
| **3** | `신한은행.png` | `bank_shinhan.png` | `SHINHAN` | 신한은행 | Shinhan Bank | Ngân hàng Shinhan | `assets/images/bank/bank_shinhan.png` |
| **4** | `우리은행.png` | `bank_woori.png` | `WOORI` | 우리은행 | Woori Bank | Ngân hàng Woori | `assets/images/bank/bank_woori.png` |
| **5** | `농협.png` | `bank_nh.png` | `NH` | 농협 (NH농협은행) | NH NongHyup Bank | Ngân hàng Nông Nghiệp Hàn Quốc | `assets/images/bank/bank_nh.png` |
| **6** | `기업은행.png` | `bank_ibk.png` | `IBK` | 기업은행 (IBK) | Industrial Bank of Korea | Ngân hàng Doanh nghiệp Hàn Quốc | `assets/images/bank/bank_ibk.png` |
| **7** | `카카오뱅크.png` | `bank_kakao.png` | `KAKAO` | 카카오뱅크 | KakaoBank | Ngân hàng số KakaoBank | `assets/images/bank/bank_kakao.png` |
| **8** | `토스뱅크.png` | `bank_toss.png` | `TOSS` | 토스뱅크 | Toss Bank | Ngân hàng số Toss Bank | `assets/images/bank/bank_toss.png` |
| **9** | `케이뱅크.png` | `bank_kbank.png` | `KBANK` | 케이뱅크 | K Bank | Ngân hàng số K Bank | `assets/images/bank/bank_kbank.png` |
| **10** | `수협.png` | `bank_suhyup.png` | `SUHYUP` | 수협은행 | Sh Suhyup Bank | Ngân hàng Thủy sản Hàn Quốc | `assets/images/bank/bank_suhyup.png` |
| **11** | `부산은행.png` | `bank_busan.png` | `BUSAN` | 부산은행 | BNK Busan Bank | Ngân hàng Busan | `assets/images/bank/bank_busan.png` |
| **12** | `경남은행.png` | `bank_gyeongnam.png` | `BNK_GN` | 경남은행 | BNK Kyongnam Bank | Ngân hàng Gyeongnam | `assets/images/bank/bank_gyeongnam.png` |
| **13** | `iM뱅크(구)대구.png` | `bank_dgb.png` | `DGB` | iM뱅크 ((구)대구은행) | iM Bank (formerly DGB Daegu) | Ngân hàng iM (Daegu cũ) | `assets/images/bank/bank_dgb.png` |
| **14** | `광주은행.png` | `bank_gwangju.png` | `KWANGJU` | 광주은행 | Kwangju Bank | Ngân hàng Gwangju | `assets/images/bank/bank_gwangju.png` |
| **15** | `전북은행.png` | `bank_jeonbuk.png` | `JEONBUK` | 전북은행 | JB Jeonbuk Bank | Ngân hàng Jeonbuk | `assets/images/bank/bank_jeonbuk.png` |
| **16** | `제주은행.png` | `bank_jeju.png` | `JEJU` | 제주은행 | Jeju Bank | Ngân hàng đảo Jeju | `assets/images/bank/bank_jeju.png` |
| **17** | `SC제일은행.png` | `bank_sc.png` | `SC` | SC제일은행 | Standard Chartered Bank Korea | Ngân hàng SC Jeil | `assets/images/bank/bank_sc.png` |
| **18** | `한국씨티은행.png` | `bank_citi.png` | `CITI` | 한국씨티은행 | Citibank Korea | Ngân hàng Citibank Hàn Quốc | `assets/images/bank/bank_citi.png` |
| **19** | `우체국.png` | `bank_post.png` | `POST` | 우체국 | Korea Post | Bưu điện Hàn Quốc (Korea Post) | `assets/images/bank/bank_post.png` |
| **20** | `새마을금고.png` | `bank_kfcc.png` | `KFCC` | 새마을금고 | Saemaul Geumgo (KFCC) | Quỹ tín dụng cộng đồng Saemaul | `assets/images/bank/bank_kfcc.png` |
| **21** | `신협.png` | `bank_cu.png` | `CU` | 신협 (신용협동조합) | Credit Union Korea (CU) | Hiệp hội Hợp tác Tín dụng HQ | `assets/images/bank/bank_cu.png` |
| **22** | `상호저축은행.png` | `bank_savings.png` | `SAVINGS` | 상호저축은행 | Mutual Savings Bank | Ngân hàng Tiết kiệm Tương hỗ | `assets/images/bank/bank_savings.png` |
| **23** | `산림조합중앙회.png` | `bank_sanlim.png` | `SANLIM` | 산림조합중앙회 | National Forestry Cooperative | Hiệp hội Hợp tác Lâm nghiệp HQ | `assets/images/bank/bank_sanlim.png` |
| **24** | `산업은행.png` | `bank_kdb.png` | `KDB` | 산업은행 (KDB) | Korea Development Bank | Ngân hàng Phát triển Hàn Quốc | `assets/images/bank/bank_kdb.png` |
| **25** | `도이치은행.png` | `bank_deutsche.png` | `DEUTSCHE` | 도이치은행 | Deutsche Bank Korea | Ngân hàng Deutsche Bank | `assets/images/bank/bank_deutsche.png` |
| **26** | `뱅크오브아메리카.png` | `bank_boa.png` | `BOA` | 뱅크오브아메리카 | Bank of America | Ngân hàng Bank of America | `assets/images/bank/bank_boa.png` |
| **27** | `BNP파리바은행.png` | `bank_bnp.png` | `BNP` | BNP파리바은행 | BNP Paribas Korea | Ngân hàng BNP Paribas | `assets/images/bank/bank_bnp.png` |
| **28** | `HSBC은행.png` | `bank_hsbc.png` | `HSBC` | HSBC은행 | HSBC Bank Korea | Ngân hàng HSBC Hàn Quốc | `assets/images/bank/bank_hsbc.png` |
| **29** | `JP모건체이스.png` | `bank_jpmorgan.png` | `JPMORGAN`| JP모건체이스 | JPMorgan Chase Bank | Ngân hàng JPMorgan Chase | `assets/images/bank/bank_jpmorgan.png` |
| **30** | `중국은행.png` | `bank_boc.png` | `BOC` | 중국은행 | Bank of China (BOC) | Ngân hàng Trung Quốc | `assets/images/bank/bank_boc.png` |
| **31** | `중국건설은행.png` | `bank_ccb.png` | `CCB` | 중국건설은행 | China Construction Bank (CCB) | Ngân hàng Xây dựng Trung Quốc | `assets/images/bank/bank_ccb.png` |
| **32** | `중국공상은행.png` | `bank_icbc.png` | `ICBC` | 중국공상은행 | ICBC Korea | Ngân hàng Công thương Trung Quốc | `assets/images/bank/bank_icbc.png` |
| **33** | `국세.png` | `bank_national_tax.png` | `NATIONAL_TAX`| 국세 | National Tax (NTS) | Thuế Quốc gia Hàn Quốc | `assets/images/bank/bank_national_tax.png` |
| **34** | `지방세입.png` | `bank_local_tax.png` | `LOCAL_TAX` | 지방세입 | Local Tax Revenue (Wetax) | Thuế Địa phương Hàn Quốc | `assets/images/bank/bank_local_tax.png` |
| **35** | `관세.png` | `bank_customs.png` | `CUSTOMS` | 관세 | Customs Duty | Thuế Quan / Hải quan Hàn Quốc | `assets/images/bank/bank_customs.png` |

---

## 2. Phân Loại Ngân Hàng (Categories)

### 2.1. Ngân Hàng Thương Mại & Trực Tuyến Lớn (Major Commercial & Internet Banks)
- `bank_hana.png` (Hana Bank)
- `bank_kb.png` (KB Kookmin Bank)
- `bank_shinhan.png` (Shinhan Bank)
- `bank_woori.png` (Woori Bank)
- `bank_nh.png` (NH NongHyup Bank)
- `bank_ibk.png` (IBK Industrial Bank)
- `bank_kakao.png` (KakaoBank)
- `bank_toss.png` (Toss Bank)
- `bank_kbank.png` (K Bank)
- `bank_sc.png` (SC First Bank)
- `bank_citi.png` (Citibank Korea)

### 2.2. Ngân Hàng Địa Phương (Regional Banks)
- `bank_busan.png` (BNK Busan Bank)
- `bank_gyeongnam.png` (BNK Kyongnam Bank)
- `bank_dgb.png` (iM Bank / Daegu Bank)
- `bank_gwangju.png` (Kwangju Bank)
- `bank_jeonbuk.png` (JB Jeonbuk Bank)
- `bank_jeju.png` (Jeju Bank)

### 2.3. Hợp Tác Xã & Ngân Hàng Chuyên Biệt (Cooperatives & Specialized)
- `bank_suhyup.png` (Sh Suhyup Bank)
- `bank_kfcc.png` (Saemaul Geumgo / KFCC)
- `bank_cu.png` (Credit Union Korea / 신협)
- `bank_post.png` (Korea Post / 우체국)
- `bank_savings.png` (Mutual Savings Bank / 상호저축은행)
- `bank_sanlim.png` (Forestry Cooperative / 산림조합중앙회)
- `bank_kdb.png` (Korea Development Bank / 산업은행)

### 2.4. Ngân Hàng Quốc Tế Tại Hàn Quốc (Foreign Banks in Korea)
- `bank_deutsche.png` (Deutsche Bank)
- `bank_boa.png` (Bank of America)
- `bank_bnp.png` (BNP Paribas)
- `bank_hsbc.png` (HSBC Bank)
- `bank_jpmorgan.png` (JPMorgan Chase)
- `bank_boc.png` (Bank of China)
- `bank_ccb.png` (China Construction Bank)
- `bank_icbc.png` (Industrial and Commercial Bank of China)

### 2.5. Cơ Quan Thuế & Ngân Sách (Taxes & Public Revenues)
- `bank_national_tax.png` (National Tax / 국세)
- `bank_local_tax.png` (Local Tax Revenue / 지방세입)
- `bank_customs.png` (Customs Duty / 관세)

---

## 3. Cách Sử Dụng Trong Source Code Flutter

```dart
// 1. Sử dụng trực tiếp Image.asset
Image.asset(
  'assets/images/bank/bank_hana.png',
  width: 28,
  height: 28,
);

// 2. Sử dụng qua BankModel
final bank = BankModel(
  name: '하나은행',
  code: 'HANA',
  imageUrl: 'assets/images/bank/bank_hana.png',
);

// 3. Sử dụng Assets.gen.dart (sau khi chạy build_runner)
Assets.images.bank.bankHana.image(width: 28, height: 28);
```
