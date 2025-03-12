import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Plaid 웹훅 검증 미들웨어
export const verifyPlaidWebhook = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const plaidSignature = req.headers['plaid-verification'] as string;

        if (!plaidSignature) {
            res.status(401).json({ message: 'Missing signature' });
            return;
        }

        const webhookSecret = process.env.PLAID_WEBHOOK_SECRET;

        if (!webhookSecret) {
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        const body = JSON.stringify(req.body);
        const hmac = crypto.createHmac('sha256', webhookSecret);
        hmac.update(body);
        const computedSignature = hmac.digest('hex');

        if (computedSignature !== plaidSignature) {
            res.status(401).json({ message: 'Invalid signature' });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Webhook verification failed' });
        return;
    }
}; 