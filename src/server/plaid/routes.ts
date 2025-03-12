import express, { Request, Response, NextFunction } from 'express';
import { plaidClient } from './client';
import { WebhookType, Products, CountryCode } from 'plaid';

const router = express.Router();

// Link 토큰 생성
router.post('/create-link-token', async (req, res) => {
    try {
        const response = await plaidClient.linkTokenCreate({
            user: { client_user_id: 'unique_user_id' },
            client_name: 'BudgetTracker',
            products: ['auth', 'transactions'] as Array<Products>,
            country_codes: ['US'] as Array<CountryCode>,
            language: 'en',
            android_package_name: 'org.reactjs.native.example.BudgetTrackerNew1'  // redirect_uri 대신 이것만 사용
        });

        console.log('Link token created:', response.data.link_token);
        res.json({ link_token: response.data.link_token });
    } catch (error: any) {
        console.error('Error details:', error.response?.data);
        res.status(500).json({ error: 'Failed to create link token' });
    }
});

// Public 토큰 교환
router.post('/exchange-token', async (req, res) => {
    try {
        const { publicToken } = req.body;

        console.log('Exchanging public token:', publicToken); // 디버깅용

        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken
        });

        console.log('Exchange response:', response.data); // 디버깅용

        res.json({
            access_token: response.data.access_token,
            item_id: response.data.item_id
        });
    } catch (error: any) {
        console.error('Token exchange error:', error.response?.data);
        res.status(500).json({
            error: 'Failed to exchange token',
            details: error.response?.data
        });
    }
});

// Webhook 처리
router.post('/webhook', async (req, res) => {
    try {
        const { webhook_type, webhook_code } = req.body;

        switch (webhook_type) {
            case WebhookType.Auth:
                console.log('Auth webhook received:', webhook_code);
                break;
            case WebhookType.Transactions:
                console.log('Transactions webhook received:', webhook_code);
                break;
            default:
                console.log('Unknown webhook type:', webhook_type);
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

// 계좌 정보 가져오기 라우트 수정
router.post('/get-accounts', (req: Request, res: Response, next: NextFunction) => {
    const { access_token } = req.body;
    console.log('Getting accounts for access token:', access_token);

    plaidClient.accountsGet({
        access_token: access_token
    })
        .then(response => {
            console.log('Plaid accounts response:', response.data);
            res.json(response.data.accounts);
        })
        .catch(error => {
            console.error('Error getting accounts:', error.response?.data);
            res.status(500).json({
                error: 'Failed to get accounts',
                details: error.response?.data
            });
        });
});

export default router; 