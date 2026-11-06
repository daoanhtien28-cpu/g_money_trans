const mongoose = require('mongoose');

const NAME_TO_IMAGE_URL = {
  '하나은행': 'assets/images/bank/bank_hana.png',
  '국민은행': 'assets/images/bank/bank_kb.png',
  '신한은행': 'assets/images/bank/bank_shinhan.png',
  '우리은행': 'assets/images/bank/bank_woori.png',
  '농협': 'assets/images/bank/bank_nh.png',
  '기업은행': 'assets/images/bank/bank_ibk.png',
  '카카오뱅크': 'assets/images/bank/bank_kakao.png',
  '토스뱅크': 'assets/images/bank/bank_toss.png',
  '케이뱅크': 'assets/images/bank/bank_kbank.png',
  '수협': 'assets/images/bank/bank_suhyup.png',
  '부산은행': 'assets/images/bank/bank_busan.png',
  '경남은행': 'assets/images/bank/bank_gyeongnam.png',
  'iM뱅크(구)대구': 'assets/images/bank/bank_dgb.png',
  '광주은행': 'assets/images/bank/bank_gwangju.png',
  '전북은행': 'assets/images/bank/bank_jeonbuk.png',
  '제주은행': 'assets/images/bank/bank_jeju.png',
  'SC제일은행': 'assets/images/bank/bank_sc.png',
  '한국씨티은행': 'assets/images/bank/bank_citi.png',
  '우체국': 'assets/images/bank/bank_post.png',
  '새마을금고': 'assets/images/bank/bank_kfcc.png',
  '신협': 'assets/images/bank/bank_cu.png',
  '상호저축은행': 'assets/images/bank/bank_savings.png',
  '산림조합중앙회': 'assets/images/bank/bank_sanlim.png',
  '산업은행': 'assets/images/bank/bank_kdb.png',
  '도이치은행': 'assets/images/bank/bank_deutsche.png',
  '뱅크오브아메리카': 'assets/images/bank/bank_boa.png',
  'BNP파리바은행': 'assets/images/bank/bank_bnp.png',
  'HSBC은행': 'assets/images/bank/bank_hsbc.png',
  'JP모건체이스': 'assets/images/bank/bank_jpmorgan.png',
  '중국은행': 'assets/images/bank/bank_boc.png',
  '중국건설은행': 'assets/images/bank/bank_ccb.png',
  '중국공상은행': 'assets/images/bank/bank_icbc.png',
  '국세': 'assets/images/bank/bank_national_tax.png',
  '지방세입': 'assets/images/bank/bank_local_tax.png',
  '관세': 'assets/images/bank/bank_customs.png',
};

async function run() {
  const uri = process.env.MONGODB_URI || 'MONGODB_URI=mongodb+srv://daoanhtien232001_db_user1:Tien23092001@cluster0.evpvqit.mongodb.net/my_database?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection;
  const banksCol = db.collection('banks');
  const walletsCol = db.collection('wallets');
  const txCol = db.collection('transactions');

  // 1. Update banks collection
  for (const [name, imageUrl] of Object.entries(NAME_TO_IMAGE_URL)) {
    const res = await banksCol.updateOne(
      { name },
      { $set: { imageUrl, updatedAt: new Date() } }
    );
    console.log(`Updated bank [${name}] -> ${imageUrl} (matched: ${res.matchedCount})`);
  }

  // 2. Update wallets collection
  const walletRes = await walletsCol.updateMany(
    {},
    { $set: { imageUrl: 'assets/images/bank/bank_suhyup.png', updatedAt: new Date() } }
  );
  console.log(`Updated ${walletRes.modifiedCount} wallets imageUrl to bank_suhyup.png`);

  // 3. Update transactions collection
  const txs = await txCol.find({}).toArray();
  for (const tx of txs) {
    const paymentBank = { ...tx.paymentBank };
    const beneficiaryBank = { ...tx.beneficiaryBank };

    if (NAME_TO_IMAGE_URL[paymentBank.name]) {
      paymentBank.imageUrl = NAME_TO_IMAGE_URL[paymentBank.name];
    } else if (paymentBank.bankCode === 'SH') {
      paymentBank.imageUrl = 'assets/images/bank/bank_suhyup.png';
    }

    if (NAME_TO_IMAGE_URL[beneficiaryBank.name]) {
      beneficiaryBank.imageUrl = NAME_TO_IMAGE_URL[beneficiaryBank.name];
    } else if (beneficiaryBank.bankCode === 'SH') {
      beneficiaryBank.imageUrl = 'assets/images/bank/bank_suhyup.png';
    }

    await txCol.updateOne(
      { _id: tx._id },
      { $set: { paymentBank, beneficiaryBank, updatedAt: new Date() } }
    );
  }
  console.log(`Updated ${txs.length} transactions image URLs.`);

  await mongoose.disconnect();
  console.log('Done!');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
