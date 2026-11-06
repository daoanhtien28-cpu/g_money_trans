const mongoose = require('mongoose');

const ALL_35_BANKS = [
  // ── Hàng 1 ──────────────────────────────────
  {
    code: 'SH',
    name: '수협',
    shortName: '수협',
    binCode: '007',
    color: '#005596',
    imageUrl: 'assets/images/bank/bank_suhyup.png',
    order: 1,
    isActive: true,
  },
  {
    code: 'NH',
    name: '농협',
    shortName: '농협',
    binCode: '011',
    color: '#00A062',
    imageUrl: 'assets/images/bank/bank_nh.png',
    order: 2,
    isActive: true,
  },
  // ── Hàng 2 ──────────────────────────────────
  {
    code: 'KB',
    name: '국민은행',
    shortName: '국민',
    binCode: '004',
    color: '#FFBC00',
    imageUrl: 'assets/images/bank/bank_kb.png',
    order: 3,
    isActive: true,
  },
  {
    code: 'SHINHAN',
    name: '신한은행',
    shortName: '신한',
    binCode: '088',
    color: '#0046FF',
    imageUrl: 'assets/images/bank/bank_shinhan.png',
    order: 4,
    isActive: true,
  },
  // ── Hàng 3 ──────────────────────────────────
  {
    code: 'WOORI',
    name: '우리은행',
    shortName: '우리',
    binCode: '020',
    color: '#0067AC',
    imageUrl: 'assets/images/bank/bank_woori.png',
    order: 5,
    isActive: true,
  },
  {
    code: 'IBK',
    name: '기업은행',
    shortName: '기업',
    binCode: '003',
    color: '#1A4B9C',
    imageUrl: 'assets/images/bank/bank_ibk.png',
    order: 6,
    isActive: true,
  },
  // ── Hàng 4 ──────────────────────────────────
  {
    code: 'HANA',
    name: '하나은행',
    shortName: '하나',
    binCode: '081',
    color: '#008485',
    imageUrl: 'assets/images/bank/bank_hana.png',
    order: 7,
    isActive: true,
  },
  {
    code: 'KAKAO',
    name: '카카오뱅크',
    shortName: '카카오',
    binCode: '090',
    color: '#FEE500',
    imageUrl: 'assets/images/bank/bank_kakao.png',
    order: 8,
    isActive: true,
  },
  // ── Hàng 5 ──────────────────────────────────
  {
    code: 'KFCC',
    name: '새마을금고',
    shortName: '새마을',
    binCode: '045',
    color: '#005DAA',
    imageUrl: 'assets/images/bank/bank_kfcc.png',
    order: 9,
    isActive: true,
  },
  {
    code: 'BUSAN',
    name: '부산은행',
    shortName: '부산',
    binCode: '032',
    color: '#E30613',
    imageUrl: 'assets/images/bank/bank_busan.png',
    order: 10,
    isActive: true,
  },
  // ── Hàng 6 ──────────────────────────────────
  {
    code: 'POST',
    name: '우체국',
    shortName: '우체국',
    binCode: '071',
    color: '#ED1C24',
    imageUrl: 'assets/images/bank/bank_post.png',
    order: 11,
    isActive: true,
  },
  {
    code: 'CU',
    name: '신협',
    shortName: '신협',
    binCode: '048',
    color: '#004380',
    imageUrl: 'assets/images/bank/bank_cu.png',
    order: 12,
    isActive: true,
  },
  // ── Hàng 7 ──────────────────────────────────
  {
    code: 'SC',
    name: 'SC제일은행',
    shortName: 'SC제일',
    binCode: '023',
    color: '#00A3E0',
    imageUrl: 'assets/images/bank/bank_sc.png',
    order: 13,
    isActive: true,
  },
  {
    code: 'KYONGNAM',
    name: '경남은행',
    shortName: '경남',
    binCode: '039',
    color: '#C51D24',
    imageUrl: 'assets/images/bank/bank_gyeongnam.png',
    order: 14,
    isActive: true,
  },
  // ── Hàng 8 ──────────────────────────────────
  {
    code: 'DGB',
    name: 'iM뱅크(구)대구',
    shortName: 'iM뱅크',
    binCode: '031',
    color: '#0077C8',
    imageUrl: 'assets/images/bank/bank_dgb.png',
    order: 15,
    isActive: true,
  },
  {
    code: 'KWANGJU',
    name: '광주은행',
    shortName: '광주',
    binCode: '034',
    color: '#003882',
    imageUrl: 'assets/images/bank/bank_gwangju.png',
    order: 16,
    isActive: true,
  },
  // ── Hàng 9 ──────────────────────────────────
  {
    code: 'JEONBUK',
    name: '전북은행',
    shortName: '전북',
    binCode: '037',
    color: '#004B9B',
    imageUrl: 'assets/images/bank/bank_jeonbuk.png',
    order: 17,
    isActive: true,
  },
  {
    code: 'JEJU',
    name: '제주은행',
    shortName: '제주',
    binCode: '035',
    color: '#004B9B',
    imageUrl: 'assets/images/bank/bank_jeju.png',
    order: 18,
    isActive: true,
  },
  // ── Hàng 10 ─────────────────────────────────
  {
    code: 'CITI',
    name: '한국씨티은행',
    shortName: '씨티',
    binCode: '027',
    color: '#002D72',
    imageUrl: 'assets/images/bank/bank_citi.png',
    order: 19,
    isActive: true,
  },
  {
    code: 'SAVING',
    name: '상호저축은행',
    shortName: '저축은행',
    binCode: '050',
    color: '#E63946',
    imageUrl: 'assets/images/bank/bank_savings.png',
    order: 20,
    isActive: true,
  },
  // ── Hàng 11 ─────────────────────────────────
  {
    code: 'KBANK',
    name: '케이뱅크',
    shortName: '케이뱅크',
    binCode: '089',
    color: '#00E676',
    imageUrl: 'assets/images/bank/bank_kbank.png',
    order: 21,
    isActive: true,
  },
  {
    code: 'KDB',
    name: '산업은행',
    shortName: '산은',
    binCode: '002',
    color: '#0C4DA2',
    imageUrl: 'assets/images/bank/bank_kdb.png',
    order: 22,
    isActive: true,
  },
  // ── Hàng 12 ─────────────────────────────────
  {
    code: 'KMSFC',
    name: '산림조합중앙회',
    shortName: '산림조합',
    binCode: '064',
    color: '#2E7D32',
    imageUrl: 'assets/images/bank/bank_sanlim.png',
    order: 23,
    isActive: true,
  },
  {
    code: 'HSBC',
    name: 'HSBC은행',
    shortName: 'HSBC',
    binCode: '054',
    color: '#DB0011',
    imageUrl: 'assets/images/bank/bank_hsbc.png',
    order: 24,
    isActive: true,
  },
  // ── Hàng 13 ─────────────────────────────────
  {
    code: 'BOA',
    name: '뱅크오브아메리카',
    shortName: 'BOA',
    binCode: '060',
    color: '#E31837',
    imageUrl: 'assets/images/bank/bank_boa.png',
    order: 25,
    isActive: true,
  },
  {
    code: 'JPMORGAN',
    name: 'JP모건체이스',
    shortName: 'JP모건',
    binCode: '057',
    color: '#111111',
    imageUrl: 'assets/images/bank/bank_jpmorgan.png',
    order: 26,
    isActive: true,
  },
  // ── Hàng 14 ─────────────────────────────────
  {
    code: 'BNP',
    name: 'BNP파리바은행',
    shortName: 'BNP',
    binCode: '061',
    color: '#00965E',
    imageUrl: 'assets/images/bank/bank_bnp.png',
    order: 27,
    isActive: true,
  },
  {
    code: 'ICBC',
    name: '중국공상은행',
    shortName: '공상은행',
    binCode: '062',
    color: '#C7000B',
    imageUrl: 'assets/images/bank/bank_icbc.png',
    order: 28,
    isActive: true,
  },
  // ── Hàng 15 ─────────────────────────────────
  {
    code: 'CCB',
    name: '중국건설은행',
    shortName: '건설은행',
    binCode: '067',
    color: '#003B82',
    imageUrl: 'assets/images/bank/bank_ccb.png',
    order: 29,
    isActive: true,
  },
  {
    code: 'DEUTSCHE',
    name: '도이치은행',
    shortName: '도이치',
    binCode: '055',
    color: '#0018A8',
    imageUrl: 'assets/images/bank/bank_deutsche.png',
    order: 30,
    isActive: true,
  },
  // ── Hàng 16 ─────────────────────────────────
  {
    code: 'BOC',
    name: '중국은행',
    shortName: '중국은행',
    binCode: '063',
    color: '#B22222',
    imageUrl: 'assets/images/bank/bank_boc.png',
    order: 31,
    isActive: true,
  },
  {
    code: 'TOSS',
    name: '토스뱅크',
    shortName: '토스',
    binCode: '092',
    color: '#0064FF',
    imageUrl: 'assets/images/bank/bank_toss.png',
    order: 32,
    isActive: true,
  },
  // ── Hàng 17 ─────────────────────────────────
  {
    code: 'NTAX',
    name: '국세',
    shortName: '국세',
    binCode: '095',
    color: '#1C355E',
    imageUrl: 'assets/images/bank/bank_national_tax.png',
    order: 33,
    isActive: true,
  },
  {
    code: 'LTAX',
    name: '지방세입',
    shortName: '지방세',
    binCode: '097',
    color: '#2B6CB0',
    imageUrl: 'assets/images/bank/bank_local_tax.png',
    order: 34,
    isActive: true,
  },
  // ── Hàng 18 ─────────────────────────────────
  {
    code: 'CUSTOMS',
    name: '관세',
    shortName: '관세',
    binCode: '096',
    color: '#1A365D',
    imageUrl: 'assets/images/bank/bank_customs.png',
    order: 35,
    isActive: true,
  },
];

async function run() {
  const uri = process.env.MONGODB_URI || 'MONGODB_URI=mongodb+srv://daoanhtien232001_db_user1:Tien23092001@cluster0.evpvqit.mongodb.net/my_database?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const collection = mongoose.connection.collection('banks');

  // Xóa bank SUHYUP cũ nếu còn tồn tại để tránh trùng lặp với SH
  await collection.deleteOne({ code: 'SUHYUP' });

  for (const bank of ALL_35_BANKS) {
    await collection.updateOne(
      { code: bank.code },
      {
        $set: {
          code: bank.code,
          name: bank.name,
          shortName: bank.shortName,
          binCode: bank.binCode,
          color: bank.color,
          imageUrl: bank.imageUrl,
          order: bank.order,
          isActive: bank.isActive,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  const total = await collection.countDocuments();
  console.log(`Total banks in collection: ${total}`);

  const banks = await collection.find({}).sort({ order: 1 }).toArray();
  console.log('--- List of Banks in DB (Sorted by order) ---');
  banks.forEach((b) => {
    console.log(`[#${String(b.order).padStart(2, ' ')}] ${b.code.padEnd(10)} | ${b.name.padEnd(14)} | ${b.imageUrl}`);
  });

  await mongoose.disconnect();
  console.log('Finished successfully.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
