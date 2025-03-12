import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { authenticateToken } from './middleware/auth';

// 라우터 가져오기
import transactionsRouter from './routes/transactions';
import accountsRouter from './routes/accounts';
import webhooksRouter from './routes/webhooks';
import authRouter from './routes/auth';
import plaidRouter from './routes/plaid';
import usersRouter from './routes/users';
import incomeRouter from './routes/income';

const app = express();

// 미들웨어 설정
app.use(helmet()); // 보안 헤더 설정
app.use(cors()); // CORS 설정
app.use(morgan('dev')); // 로깅
app.use(express.json()); // JSON 파싱

// API 라우트 설정
app.use('/api/auth', authRouter);
app.use('/api/plaid', authenticateToken, plaidRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/accounts', authenticateToken, accountsRouter);
app.use('/api/transactions', authenticateToken, transactionsRouter);
app.use('/api/income', authenticateToken, incomeRouter);
app.use('/api/webhooks', webhooksRouter); // 웹훅은 인증 미들웨어 제외

// 에러 핸들링 미들웨어
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app; 