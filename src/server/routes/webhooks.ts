import express, { Request, Response } from 'express';
import { plaidClient } from '../plaid/client';
import { prisma } from '../db/prisma';
import { verifyPlaidWebhook } from '../middleware/plaidWebhook';

const router = express.Router();

// Plaid 웹훅 처리 엔드포인트
router.post('/plaid', verifyPlaidWebhook, async (req: Request, res: Response): Promise<void> => {
    try {
        const { webhook_type, webhook_code, item_id } = req.body;

        // 해당 item_id를 가진 사용자 찾기
        const plaidItem = await prisma.plaidItem.findUnique({
            where: { plaidItemId: item_id },
            include: { user: true }
        });

        if (!plaidItem) {
            console.error('Plaid item not found:', item_id);
            res.status(404).json({ message: 'Item not found' });
            return;
        }

        switch (webhook_type) {
            case 'TRANSACTIONS':
                switch (webhook_code) {
                    case 'INITIAL_UPDATE':
                    case 'HISTORICAL_UPDATE':
                    case 'DEFAULT_UPDATE': {
                        // 거래내역 동기화
                        const { accessToken } = plaidItem;
                        const today = new Date();
                        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

                        const transactionsResponse = await plaidClient.transactionsGet({
                            access_token: accessToken,
                            start_date: thirtyDaysAgo.toISOString().split('T')[0],
                            end_date: new Date().toISOString().split('T')[0],
                            options: {
                                include_personal_finance_category: true,
                            },
                        });

                        // 거래내역 저장
                        const { transactions } = transactionsResponse.data;
                        for (const transaction of transactions) {
                            await prisma.transaction.upsert({
                                where: {
                                    plaidTransactionId: transaction.transaction_id,
                                },
                                update: {
                                    amount: transaction.amount,
                                    description: transaction.name,
                                    merchantName: transaction.merchant_name,
                                    category: transaction.personal_finance_category?.primary || 'other',
                                    date: new Date(transaction.date),
                                    pending: transaction.pending,
                                },
                                create: {
                                    plaidTransactionId: transaction.transaction_id,
                                    userId: plaidItem.userId,
                                    accountId: transaction.account_id,
                                    amount: transaction.amount,
                                    description: transaction.name,
                                    merchantName: transaction.merchant_name,
                                    category: transaction.personal_finance_category?.primary || 'other',
                                    date: new Date(transaction.date),
                                    pending: transaction.pending,
                                },
                            });
                        }
                        break;
                    }
                }
                break;

            case 'ITEM':
                switch (webhook_code) {
                    case 'ERROR': {
                        // 연결 오류 발생 시 사용자 상태 업데이트
                        await prisma.plaidItem.update({
                            where: { id: plaidItem.id },
                            data: {
                                error: req.body.error?.error_message || 'Unknown error',
                                status: 'ERROR',
                            },
                        });
                        break;
                    }

                    case 'PENDING_EXPIRATION': {
                        // 토큰 만료 예정 시 사용자 상태 업데이트
                        await prisma.plaidItem.update({
                            where: { id: plaidItem.id },
                            data: {
                                status: 'PENDING_EXPIRATION',
                            },
                        });
                        break;
                    }
                }
                break;
        }

        res.status(200).json({ message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
});

export default router; 