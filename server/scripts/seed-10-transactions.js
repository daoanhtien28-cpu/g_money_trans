const mongoose = require('mongoose');

async function seed() {
  const uri = process.env.MONGODB_URI || '';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection;
  const usersCol = db.collection('users');
  const walletsCol = db.collection('wallets');
  const txCol = db.collection('transactions');

  const users = await usersCol.find({}).toArray();
  if (users.length === 0) {
    console.log('No users found in database.');
    process.exit(1);
  }

  console.log(`Found ${users.length} user(s). Proceeding to seed 10 transactions for each user.`);

  for (const user of users) {
    console.log(`\nProcessing user: ${user.email || user._id} (${user.fullName || 'No Name'})`);

    // 1. Ensure user has a wallet
    let wallet = await walletsCol.findOne({ userId: user._id });
    if (!wallet) {
      const part1 = Math.floor(1000 + Math.random() * 9000);
      const part2 = Math.floor(1000 + Math.random() * 9000);
      const part3 = Math.floor(1000 + Math.random() * 9000);
      const newWallet = {
        userId: user._id,
        accountNumber: `${part1} ${part2} ${part3}`,
        ownerName: (user.fullName || 'DAO ANH TIEN').toUpperCase(),
        currency: 'KRW',
        availableBalance: 3956614,
        availableBalanceEdit: 3956614,
        totalBalance: 3956614,
        frozenBalance: 0,
        walletType: 'PERSONAL',
        status: 'ACTIVE',
        linkedBankCode: 'WOORI',
        linkedBankName: '우리은행',
        linkedBankAccount: '1002 564 778696',
        imageUrl: 'assets/images/bank/bank_woori.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const insertResult = await walletsCol.insertOne(newWallet);
      wallet = { ...newWallet, _id: insertResult.insertedId };
      console.log(`Created new default wallet for user: ${wallet.accountNumber}`);
    } else {
      await walletsCol.updateOne(
        { _id: wallet._id },
        {
          $set: {
            availableBalance: 3956614,
            availableBalanceEdit: 3956614,
            totalBalance: 3956614,
            linkedBankCode: 'WOORI',
            linkedBankName: '우리은행',
            imageUrl: 'assets/images/bank/bank_woori.png',
            updatedAt: new Date(),
          },
        }
      );
      console.log(`Updated wallet ${wallet.accountNumber} balance to 3,956,614 KRW.`);
    }

    // 2. Clear old transactions for this user
    await txCol.deleteMany({ userId: user._id });

    const ownerName = (user.fullName || wallet.ownerName || 'DAO ANH TIEN').toUpperCase();
    const userAccount = wallet.accountNumber;

    // 3. Define 10 realistic Korean transactions
    const templateTransactions = [
      {
        transferNumber: '1128OTT260925001',
        transferChannel: '우리WON',
        transferTypeTag: '이체',
        title: '(주)원코리아',
        content: '9월 급여',
        isDeposit: true,
        currency: 'KRW',
        transferAmount: 3500000,
        fee: 0,
        balanceAfter: 4350000,
        totalWithdrawalAmount: 4350000,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: '1002-841-992014',
          accountName: '(주)원코리아',
        },
        beneficiaryBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        transferTime: '2026.09.25',
        transferTimeDetail: '09:12:30',
        createdAt: new Date('2026-09-25T09:12:30.000Z'),
      },
      {
        transferNumber: '1128OTT260926002',
        transferChannel: '우리WON',
        transferTypeTag: '체크',
        title: '스타벅스 강남점',
        content: '아메리카노 결제',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 6500,
        fee: 0,
        balanceAfter: 4343500,
        totalWithdrawalAmount: 4343500,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'KB',
          name: '국민은행',
          imageUrl: 'assets/images/bank/bank_kb.png',
          accountNumber: '2938-12-984120',
          accountName: '스타벅스코리아',
        },
        transferTime: '2026.09.26',
        transferTimeDetail: '12:45:10',
        createdAt: new Date('2026-09-26T12:45:10.000Z'),
      },
      {
        transferNumber: '1128OTT260927003',
        transferChannel: '우리WON',
        transferTypeTag: '체크',
        title: '자연애마트',
        content: '식료품 구매',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 35400,
        fee: 0,
        balanceAfter: 4308100,
        totalWithdrawalAmount: 4308100,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'SHINHAN',
          name: '신한은행',
          imageUrl: 'assets/images/bank/bank_shinhan.png',
          accountNumber: '110-384-912048',
          accountName: '자연애마트',
        },
        transferTime: '2026.09.27',
        transferTimeDetail: '19:20:15',
        createdAt: new Date('2026-09-27T19:20:15.000Z'),
      },
      {
        transferNumber: '1128OTT260928004',
        transferChannel: '우리WON',
        transferTypeTag: '이체',
        title: '김민수',
        content: '모임 회비 정산',
        isDeposit: true,
        currency: 'KRW',
        transferAmount: 50000,
        fee: 0,
        balanceAfter: 4358100,
        totalWithdrawalAmount: 4358100,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'KAKAO',
          name: '카카오뱅크',
          imageUrl: 'assets/images/bank/bank_kakao.png',
          accountNumber: '3333-01-948123',
          accountName: '김민수',
        },
        beneficiaryBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        transferTime: '2026.09.28',
        transferTimeDetail: '14:10:05',
        createdAt: new Date('2026-09-28T14:10:05.000Z'),
      },
      {
        transferNumber: '1128OTT260929005',
        transferChannel: '우리WON',
        transferTypeTag: '체크',
        title: '배달의민족',
        content: '저녁식사 주문',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 24000,
        fee: 0,
        balanceAfter: 4334100,
        totalWithdrawalAmount: 4334100,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'HANA',
          name: '하나은행',
          imageUrl: 'assets/images/bank/bank_hana.png',
          accountNumber: '584-910234-84107',
          accountName: '(주)우아한형제들',
        },
        transferTime: '2026.09.29',
        transferTimeDetail: '20:35:44',
        createdAt: new Date('2026-09-29T20:35:44.000Z'),
      },
      {
        transferNumber: '1128OTT260930006',
        transferChannel: '우리WON',
        transferTypeTag: '체크',
        title: 'GS25 역삼스마트점',
        content: '도시락 및 음료',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 5800,
        fee: 0,
        balanceAfter: 4328300,
        totalWithdrawalAmount: 4328300,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'NH',
          name: '농협',
          imageUrl: 'assets/images/bank/bank_nh.png',
          accountNumber: '302-8491-0394-11',
          accountName: 'GS25역삼점',
        },
        transferTime: '2026.09.30',
        transferTimeDetail: '08:30:20',
        createdAt: new Date('2026-09-30T08:30:20.000Z'),
      },
      {
        transferNumber: '1128OTT261001007',
        transferChannel: '우리WON',
        transferTypeTag: '이체',
        title: '오피스텔 관리비',
        content: '10월분 관리비 납부',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 125000,
        fee: 0,
        balanceAfter: 4203300,
        totalWithdrawalAmount: 4203300,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: '1002-841-294012',
          accountName: '관리사무소',
        },
        transferTime: '2026.10.01',
        transferTimeDetail: '10:00:00',
        createdAt: new Date('2026-10-01T10:00:00.000Z'),
      },
      {
        transferNumber: '1128OTT261001008',
        transferChannel: '우리WON',
        transferTypeTag: '체크',
        title: '쿠팡 결제',
        content: '생필품 정기배송',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 42900,
        fee: 0,
        balanceAfter: 4160400,
        totalWithdrawalAmount: 4160400,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'KB',
          name: '국민은행',
          imageUrl: 'assets/images/bank/bank_kb.png',
          accountNumber: '849102-04-192847',
          accountName: '쿠팡(주)',
        },
        transferTime: '2026.10.01',
        transferTimeDetail: '16:40:12',
        createdAt: new Date('2026-10-01T16:40:12.000Z'),
      },
      {
        transferNumber: '1128OTT261002009',
        transferChannel: '우리WON',
        transferTypeTag: '이체',
        title: 'SKT 통신요금',
        content: '9월 이동통신요금 자동이체',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 68200,
        fee: 0,
        balanceAfter: 4092200,
        totalWithdrawalAmount: 4092200,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'SHINHAN',
          name: '신한은행',
          imageUrl: 'assets/images/bank/bank_shinhan.png',
          accountNumber: '562-019-482019',
          accountName: 'SK텔레콤(주)',
        },
        transferTime: '2026.10.02',
        transferTimeDetail: '11:15:30',
        createdAt: new Date('2026-10-02T11:15:30.000Z'),
      },
      {
        transferNumber: '1128OTT261003010',
        transferChannel: '우리WON',
        transferTypeTag: '이체',
        title: '이영희',
        content: '추석 선물 비용 정산',
        isDeposit: false,
        currency: 'KRW',
        transferAmount: 135586,
        fee: 0,
        balanceAfter: 3956614,
        totalWithdrawalAmount: 3956614,
        status: 'SUCCESS',
        paymentBank: {
          bankCode: 'WOORI',
          name: '우리은행',
          imageUrl: 'assets/images/bank/bank_woori.png',
          accountNumber: userAccount,
          accountName: ownerName,
        },
        beneficiaryBank: {
          bankCode: 'KAKAO',
          name: '카카오뱅크',
          imageUrl: 'assets/images/bank/bank_kakao.png',
          accountNumber: '3333-08-204910',
          accountName: '이영희',
        },
        transferTime: '2026.10.03',
        transferTimeDetail: '08:22:15',
        createdAt: new Date('2026-10-03T08:22:15.000Z'),
      },
    ];

    const docsToInsert = templateTransactions.map((tx) => ({
      ...tx,
      userId: user._id,
      walletId: wallet._id,
      updatedAt: tx.createdAt,
    }));

    await txCol.insertMany(docsToInsert);
    console.log(`Successfully seeded ${docsToInsert.length} transactions for user ${user.email || user._id}.`);

  }

  console.log('\nAll seeding completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
