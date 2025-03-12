import express, { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { z } from 'zod';

const router = express.Router();

interface AuthRequest extends Request {
    user: {
        id: string;
    };
}

// 수입 업데이트 스키마 (달러)
const updateIncomeSchema = z.object({
    income: z.number()
        .min(0, '수입은 0보다 커야 합니다.')
        .max(1000000000, '너무 큰 금액입니다.')
        .transform(val => Math.round(val * 100) / 100) // 소수점 둘째자리까지 반올림
});

// 수입 업데이트 API
router.put('/income', async (req: Request, res: Response): Promise<void> => {
    try {
        const authReq = req as AuthRequest;
        const userId = authReq.user?.id;

        const { income } = updateIncomeSchema.parse(req.body);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { income }
        });

        res.json({
            message: '수입이 업데이트되었습니다.',
            income: updatedUser.income
        });
    } catch (error) {
        console.error('Income update error:', error);
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: '잘못된 수입 형식입니다.', errors: error.errors });
        } else {
            res.status(400).json({ message: '수입 업데이트에 실패했습니다.' });
        }
    }
});

export default router; 