import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user: {
        id: string;
    };
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: '인증 토큰이 필요합니다.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
        (req as AuthRequest).user = { id: decoded.sub as string };
        next();
    } catch (error) {
        res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
        return;
    }
}; 