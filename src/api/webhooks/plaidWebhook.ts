import express from 'express';
import { store } from '@store/index';
import { syncTransactions } from '@store/slices/transactionSlice';

const router = express.Router();

router.post('/plaid-webhook', async (req, res) => {
    try {
        const { webhook_type, webhook_code, item_id } = req.body;

        switch (webhook_type) {
            case 'TRANSACTIONS':
                switch (webhook_code) {
                    case 'INITIAL_UPDATE':
                    case 'HISTORICAL_UPDATE':
                    case 'DEFAULT_UPDATE':
                        // 거래내역 업데이트 발생
                        const state = store.getState();
                        const accounts = state.accounts.accounts as any[];
                        store.dispatch(syncTransactions());
                        break;
                }
                break;

            case 'ITEM':
                switch (webhook_code) {
                    case 'ERROR':
                        // Plaid 연결 오류 발생
                        console.error('Plaid connection error:', req.body);
                        break;

                    case 'PENDING_EXPIRATION':
                        // 접근 토큰 만료 예정
                        // 여기서 사용자에게 알림을 보낼 수 있습니다
                        break;
                }
                break;
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
});

export default router; 