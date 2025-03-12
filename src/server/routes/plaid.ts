import express, { Request, Response, Router } from 'express';
import { plaidClient } from '../plaid/client';
import { prisma } from '../db/prisma';
import { authenticateToken } from '../middleware/auth';
import { CountryCode, Products, AccountBase } from 'plaid';

const router = Router();

interface AuthRequest extends Request {
    user: {
        id: string;
    };
}

// /api/plaid/create-link-token
router.post('/create-link-token', authenticateToken, async (req: Request, res: Response) => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;
        const { platform } = req.body;  // 클라이언트로부터 플랫폼 정보 받기

        if (!userId) {
            res.status(401).json({ error: 'User ID not found' });
            return;
        }

        const configs = {
            user: {
                client_user_id: userId
            },
            client_name: 'Budgy',
            products: [Products.Auth, Products.Transactions] as Products[],
            country_codes: [CountryCode.Us] as CountryCode[],
            language: 'en',
            redirect_uri: 'https://1d50-2600-1700-7a-7000-d4a1-c509-d4f8-7db0.ngrok-free.app'
        };

        // 플랫폼별 설정 추가
        if (platform === 'android') {
            Object.assign(configs, {
                android_package_name: 'org.reactjs.native.example.Budgy'
            });
        }

        console.log('Creating link token with configs:', JSON.stringify(configs, null, 2));
        try {
            const createTokenResponse = await plaidClient.linkTokenCreate(configs);
            console.log('Link token created successfully:', createTokenResponse.data);
            res.json(createTokenResponse.data);
        } catch (error: any) {
            console.error('Detailed error creating link token:', {
                error: error.message,
                details: error.response?.data
            });
            res.status(500).json({
                error: 'Failed to create link token',
                details: error.response?.data || error.message
            });
        }
    } catch (error) {
        console.error('Error in create-link-token route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// /api/plaid/exchange-token
router.post('/exchange-token', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;
        const { public_token } = req.body;

        if (!public_token) {
            console.error('Missing public_token in request body');
            res.status(400).json({ error: 'public_token is required' });
            return;
        }

        console.log('Exchanging public token:', public_token);

        const exchangeResponse = await plaidClient.itemPublicTokenExchange({
            public_token: public_token
        });

        console.log('Exchange response:', exchangeResponse.data);

        const accessToken = exchangeResponse.data.access_token;
        const itemId = exchangeResponse.data.item_id;

        // plaidItem 생성
        console.log('Creating plaidItem for user:', userId);
        const plaidItem = await prisma.plaidItem.create({
            data: {
                userId,
                accessToken,
                plaidItemId: itemId,
                status: 'active'
            }
        });
        console.log('PlaidItem created:', plaidItem);

        // 초기 거래내역 동기화
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const transactionsResponse = await plaidClient.transactionsGet({
            access_token: accessToken,
            start_date: thirtyDaysAgo.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0],
        });

        console.log('Initial transactions sync:', transactionsResponse.data);

        // 계좌 정보 먼저 가져오기
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken
        });

        // 계좌 정보 저장 및 매핑 생성
        const accountMapping = new Map();
        for (const plaidAccount of accountsResponse.data.accounts) {
            const account = await prisma.account.create({
                data: {
                    userId,
                    plaidItemId: plaidItem.id,
                    plaidAccountId: plaidAccount.account_id,
                    name: plaidAccount.name,
                    type: plaidAccount.type,
                    subtype: plaidAccount.subtype,
                    balance: plaidAccount.balances.current || 0,
                    availableBalance: plaidAccount.balances.available || 0,
                    persistent_account_id: plaidAccount.persistent_account_id,
                    lastUpdated: new Date()
                }
            });
            accountMapping.set(plaidAccount.account_id, account.id);
        }

        // 거래내역 저장 (accountId 매핑 사용)
        for (const transaction of transactionsResponse.data.transactions) {
            const accountId = accountMapping.get(transaction.account_id);
            if (accountId) {
                await prisma.transaction.create({
                    data: {
                        userId,
                        accountId,  // 매핑된 accountId 사용
                        plaidTransactionId: transaction.transaction_id,
                        amount: transaction.amount,
                        date: new Date(transaction.date),
                        description: transaction.name,
                        merchantName: transaction.merchant_name || '',
                        category: transaction.category ? transaction.category[0] : '',
                        pending: transaction.pending
                    }
                });
            }
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error exchanging token:', error);
        res.status(500).json({ error: 'Failed to exchange token' });
    }
});

// /api/plaid/get-accounts
router.post('/get-accounts', authenticateToken, async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        const plaidItem = await prisma.plaidItem.findFirst({
            where: {
                userId,
                status: 'active'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!plaidItem) {
            res.status(404).json({ error: 'No active Plaid connection found' });
            return;
        }

        const accountsResponse = await plaidClient.accountsGet({
            access_token: plaidItem.accessToken
        });

        console.log('Plaid accounts response:', accountsResponse.data);

        const accounts = accountsResponse.data.accounts.map((account: AccountBase) => ({
            account_id: account.account_id,
            plaidAccountId: account.account_id,
            name: account.name,
            type: account.type,
            subtype: account.subtype,
            balances: account.balances,
            balance: account.balances?.current ?? 0,
            availableBalance: account.balances?.available ?? 0,
            persistent_account_id: account.persistent_account_id,
            lastUpdated: new Date()
        }));

        res.json(accounts);
    } catch (error) {
        console.error('Error getting accounts:', error);
        res.status(500).json({ error: 'Failed to get accounts' });
    }
});

// /api/plaid/access-token
router.get('/access-token', authenticateToken, async (req: Request, res: Response) => {
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

        res.json({ accessToken: plaidItem.accessToken });
    } catch (error) {
        console.error('Error fetching access token:', error);
        res.status(500).json({ error: 'Failed to fetch access token' });
    }
});

// transactions 엔드포인트 추가
router.get('/transactions', authenticateToken, async (req: Request, res: Response) => {
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
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// OAuth 콜백 처리
router.get('/oauth-callback', async (req: Request, res: Response) => {
    try {
        const { state, oauth_state_id } = req.query;

        console.log('OAuth callback received:', {
            state,
            oauth_state_id
        });

        // OAuth 상태를 검증하고 앱으로 리다이렉트
        res.redirect(`budgy://oauth?state=${state}&oauth_state_id=${oauth_state_id}`);
    } catch (error) {
        console.error('Error in OAuth callback:', error);
        res.status(500).json({ error: 'OAuth callback failed' });
    }
});

export default router; 