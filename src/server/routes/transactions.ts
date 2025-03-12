import express, { Request, Response } from 'express';
import { plaidClient } from '../plaid/client';
import { prisma } from '../db/prisma';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// 거래내역 동기화 엔드포인트
router.post('/sync', authenticateToken, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        // Plaid Item 확인
        const plaidItem = await prisma.plaidItem.findFirst({
            where: { userId },
            select: { accessToken: true }
        });

        if (!plaidItem?.accessToken) {
            res.status(404).json({ error: 'Plaid access token not found' });
            return;
        }

        // 2. Plaid에서 거래내역 가져오기
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const plaidResponse = await plaidClient.transactionsGet({
            access_token: plaidItem.accessToken,
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0],
        });

        console.log('Plaid transactions response:', plaidResponse);

        // 3. 계좌 ID 매핑 생성
        const accounts = await prisma.account.findMany({
            where: { userId },
            select: { id: true, plaidAccountId: true }
        });

        const accountMapping = new Map(
            accounts.map((acc: { plaidAccountId: string; id: string }) => [acc.plaidAccountId, acc.id])
        );

        // 4. 새로운 거래내역 저장
        for (const transaction of plaidResponse.data.transactions) {
            const accountId = accountMapping.get(transaction.account_id);
            if (!accountId) continue;  // 매핑된 계좌가 없으면 건너뛰기

            await prisma.transaction.upsert({
                where: {
                    plaidTransactionId: transaction.transaction_id
                },
                update: {
                    amount: transaction.amount,
                    date: new Date(transaction.date),
                    description: transaction.name,
                    merchantName: transaction.merchant_name || '',
                    category: transaction.category ? transaction.category[0] : '',
                    pending: transaction.pending
                },
                create: {
                    accountId,
                    plaidTransactionId: transaction.transaction_id,
                    amount: transaction.amount,
                    date: new Date(transaction.date),
                    description: transaction.name,
                    merchantName: transaction.merchant_name || '',
                    category: transaction.category ? transaction.category[0] : '',
                    pending: transaction.pending,
                    userId
                }
            });
        }

        // 5. 저장된 거래내역 반환
        const savedTransactions = await prisma.transaction.findMany({
            where: { account: { userId } }
        });

        res.json({ success: true, data: { transactions: savedTransactions } });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Failed to sync transactions' });
    }
});

router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;
        const { startDate, endDate, category } = req.query;

        if (!userId) {
            res.status(401).json({ error: '인증되지 않은 사용자입니다' });
            return;
        }

        // 사용자의 계좌 ID들 조회
        const userAccounts = await prisma.account.findMany({
            where: { userId },
            select: { id: true }
        });

        const accountIds = userAccounts.map((account: { id: string }) => account.id);

        // 필터 조건 구성
        const whereCondition: any = {
            accountId: {
                in: accountIds
            }
        };

        // 날짜 필터 적용
        if (startDate) {
            console.log('Applying start date filter:', startDate); // 디버깅용 로그
            whereCondition.date = {
                ...whereCondition.date,
                gte: new Date(startDate as string)
            };
        }

        if (endDate) {
            console.log('Applying end date filter:', endDate); // 디버깅용 로그
            const endDateTime = new Date(endDate as string);
            endDateTime.setHours(23, 59, 59, 999);
            whereCondition.date = {
                ...whereCondition.date,
                lte: endDateTime
            };
        }

        // 카테고리 필터 적용
        if (category && category !== '전체') {
            console.log('Applying category filter:', category); // 디버깅용 로그
            whereCondition.category = category;
        }

        console.log('Final where condition:', JSON.stringify(whereCondition, null, 2)); // 디버깅용 로그

        // 해당 계좌들의 트랜잭션 조회
        const transactions = await prisma.transaction.findMany({
            where: whereCondition,
            orderBy: {
                date: 'desc'
            },
            include: {
                account: {
                    select: {
                        name: true,
                        type: true,
                        subtype: true
                    }
                }
            }
        });

        console.log(`Found ${transactions.length} transactions`); // 디버깅용 로그
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            error: '트랜잭션 조회 실패',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Plaid에서 직접 거래내역 조회
router.get('/plaid', authenticateToken, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        const plaidItem = await prisma.plaidItem.findFirst({
            where: {
                userId,
                status: 'active'
            },
            select: {
                accessToken: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!plaidItem) {
            res.status(404).json({ error: 'No active Plaid connection found' });
            return;
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const response = await plaidClient.transactionsGet({
            access_token: plaidItem.accessToken,
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0],
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching transactions from Plaid:', error);
        res.status(500).json({ error: 'Failed to fetch transactions from Plaid' });
    }
});

export default router; 