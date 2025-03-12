import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 입력 유효성 검사를 위한 스키마
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2)
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

// 회원가입
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = registerSchema.parse(req.body);

        // 이메일 중복 확인
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: '이미 등록된 이메일입니다.' });
            return;
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                income: 0 // 기본값 설정
            },
            select: {
                id: true,
                email: true,
                name: true,
                income: true
            }
        });

        // JWT 토큰 생성
        const token = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                income: user.income
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({ message: '회원가입에 실패했습니다.' });
    }
});

// 로그인
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // 사용자 찾기
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                income: true,
                password: true
            }
        });
        if (!user) {
            res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
            return;
        }

        // 비밀번호 확인
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
            return;
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: '로그인이 완료되었습니다.',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(400).json({ message: '로그인에 실패했습니다.' });
    }
});

// 현재 사용자 정보 조회
router.get('/me', authenticateToken, async (req: any, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                income: true
            }
        });

        if (!user) {
            res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: '서버 오류가 발생했습니다.' });
    }
});

// 로그아웃
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
    try {
        // 클라이언트에서 토큰을 삭제하므로, 여기서는 성공 응답만 보냅니다
        res.status(200).json({ message: '로그아웃되었습니다.' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
    }
});

export default router; 