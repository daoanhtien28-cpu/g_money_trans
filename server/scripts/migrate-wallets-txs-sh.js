const mongoose = require('mongoose');

async function migrate() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://daoanhtien232001_db_user1:Tien23092001@cluster0.evpvqit.mongodb.net/my_database?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection;
  const banksCol = db.collection('banks');
  const walletsCol = db.collection('wallets');
  const txCol = db.collection('transactions');

  // 1. Update bank: set Suhyup to code: 'SH', order: 1
  await banksCol.deleteOne({ code: 'SUHYUP' });
  await banksCol.updateOne(
    { code: 'SH' },
    {
      $set: {
        code: 'SH',
        name: '수협',
        shortName: '수협',
        binCode: '007',
        color: '#005596',
        imageUrl: 'assets/images/bank/수협.png',
        order: 1,
        isActive: true,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  // Shift orders: HANA to 2, KB to 3, etc.
  const otherBanksOrder = [
    'HANA', 'KB', 'SHINHAN', 'WOORI', 'KAKAO', 'TOSS', 'NH', 'IBK', 'KBANK', 'SC',
    'DGB', 'BUSAN', 'KWANGJU', 'JEONBUK', 'KYONGNAM', 'JEJU', 'POST', 'KFCC', 'CU',
    'SAVING', 'KMSFC', 'KDB', 'CITI', 'HSBC', 'BNP', 'JPMORGAN', 'BOA', 'DEUTSCHE',
    'ICBC', 'BOC', 'CCB', 'NTAX', 'CUSTOMS', 'LTAX'
  ];
  for (let i = 0; i < otherBanksOrder.length; i++) {
    await banksCol.updateOne(
      { code: otherBanksOrder[i] },
      { $set: { order: i + 2 } }
    );
  }
  console.log('Banks collection updated: SH is now order 1.');

  // 2. Update Wallets: default to SH (수협)
  const walletResult = await walletsCol.updateMany(
    {},
    {
      $set: {
        linkedBankCode: 'SH',
        linkedBankName: '수협',
        imageUrl: 'assets/images/bank/수협.png',
        updatedAt: new Date(),
      },
    }
  );
  console.log(`Updated ${walletResult.modifiedCount} wallets to default SH (수협).`);

  // 3. Update Transactions:
  // - transferChannel = 'Sh 수협'
  // - Map paymentBank and beneficiaryBank to exact current banks
  const txs = await txCol.find({}).toArray();
  let txUpdatedCount = 0;

  for (const tx of txs) {
    const paymentBank = { ...tx.paymentBank };
    const beneficiaryBank = { ...tx.beneficiaryBank };

    // If paymentBank was HANA or Hana Bank, change to SH (수협)
    if (paymentBank.bankCode === 'HANA' || paymentBank.name === 'Hana Bank') {
      paymentBank.bankCode = 'SH';
      paymentBank.name = '수협';
      paymentBank.imageUrl = 'assets/images/bank/수협.png';
    } else if (paymentBank.bankCode === 'KB' || paymentBank.name === 'Kookmin Bank') {
      paymentBank.bankCode = 'KB';
      paymentBank.name = '국민은행';
      paymentBank.imageUrl = 'assets/images/bank/국민은행.png';
    }

    // If beneficiaryBank was HANA or Hana Bank, change to SH (수협)
    if (beneficiaryBank.bankCode === 'HANA' || beneficiaryBank.name === 'Hana Bank') {
      beneficiaryBank.bankCode = 'SH';
      beneficiaryBank.name = '수협';
      beneficiaryBank.imageUrl = 'assets/images/bank/수협.png';
    } else if (beneficiaryBank.bankCode === 'KB' || beneficiaryBank.name === 'Kookmin Bank') {
      beneficiaryBank.bankCode = 'KB';
      beneficiaryBank.name = '국민은행';
      beneficiaryBank.imageUrl = 'assets/images/bank/국민은행.png';
    } else if (beneficiaryBank.bankCode === 'SHINHAN' || beneficiaryBank.name === 'Shinhan Bank') {
      beneficiaryBank.bankCode = 'SHINHAN';
      beneficiaryBank.name = '신한은행';
      beneficiaryBank.imageUrl = 'assets/images/bank/신한은행.png';
    }

    await txCol.updateOne(
      { _id: tx._id },
      {
        $set: {
          transferChannel: 'Sh 수협',
          paymentBank,
          beneficiaryBank,
          updatedAt: new Date(),
        },
      }
    );
    txUpdatedCount++;
  }
  console.log(`Updated ${txUpdatedCount} transactions to Sh 수협 channel and Korean banks.`);

  await mongoose.disconnect();
  console.log('Migration completed successfully.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
