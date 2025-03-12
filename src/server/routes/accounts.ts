import express, { Request, Response, Router } from 'express';
import { prisma } from '../db/prisma';
import { authenticateToken } from '../middleware/auth';
import { plaidClient } from '../plaid/client';
import { PrismaClient } from '@prisma/client';
const router = Router();

interface AuthRequest extends Request {
    user: {
        id: string;
    };
}

// 계좌 생성
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        let accountsToProcess = [];
        if (req.body.accounts) {
            accountsToProcess = req.body.accounts;
        } else if (Array.isArray(req.body)) {
            accountsToProcess = req.body;
        } else {
            accountsToProcess = [req.body];
        }

        const results = [];
        for (const account of accountsToProcess) {
            try {
                if (!account.plaidAccountId) {
                    throw new Error('plaidAccountId is required');
                }

                const result = await prisma.account.create({
                    data: {
                        userId,
                        plaidItemId: account.plaidItemId,
                        plaidAccountId: account.plaidAccountId,
                        name: account.name,
                        type: account.type,
                        subtype: account.subtype,
                        balance: account.balance || 0,
                        availableBalance: account.availableBalance || 0,
                        persistent_account_id: account.persistent_account_id || null,
                        lastUpdated: new Date(),
                    }
                });

                results.push(result);
            } catch (err) {
                console.error('Failed to create account:', {
                    account,
                    error: err instanceof Error ? err.message : String(err)
                });
                throw err;
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error in account creation:', error);
        res.status(500).json({
            error: 'Failed to create accounts',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// 계좌 목록 조회
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ error: '인증되지 않은 사용자입니다' });
            return;
        }

        console.log('Auth request:', {
            userId,
            headers: req.headers,
            token: req.headers.authorization
        });

        const accounts = await prisma.account.findMany({
            where: { userId }
        });

        res.json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            error: '계좌 조회 실패',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// 계좌 잔액 업데이트
router.post('/update-balances', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const plaidItem = await prisma.plaidItem.findFirst({
            where: { userId },
            select: { accessToken: true }
        });

        if (!plaidItem) {
            res.status(404).json({ error: 'No Plaid connection found' });
            return;
        }

        const accounts = await prisma.account.findMany({
            where: { userId },
            select: { plaidAccountId: true }
        });

        const savedAccountIds = new Set(accounts.map((acc: any) => acc.plaidAccountId));

        const response = await plaidClient.accountsGet({
            access_token: plaidItem.accessToken
        });

        await prisma.$transaction(async (tx: any) => {
            for (const account of response.data.accounts) {
                if (savedAccountIds.has(account.account_id)) {
                    await tx.account.update({
                        where: { plaidAccountId: account.account_id },
                        data: {
                            balance: account.balances.current ?? 0,
                            availableBalance: account.balances.available ?? 0,
                            lastUpdated: new Date()
                        }
                    });
                }
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating balances:', error);
        res.status(500).json({ error: 'Failed to update balances' });
    }
});

export default router;