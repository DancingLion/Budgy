import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../api/services/authService';
import { storage } from '../../../src/utils/storage';

interface User {
    id: string;
    email: string;
    name: string;
    income: number;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }) => {
        const response = await authService.login(credentials);
        // 로그인 성공 시 토큰과 사용자 데이터 저장
        await storage.setAuthToken(response.token);
        await storage.setUserData(response.user);
        return response;
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: { email: string; password: string; name: string }) => {
        const response = await authService.register(userData);
        // 회원가입 성공 시 토큰과 사용자 데이터 저장
        await storage.setAuthToken(response.token);
        await storage.setUserData(response.user);
        return response;
    }
);

export const logoutAsync = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
    // 로그아웃 시 모든 저장된 데이터 삭제
    await storage.clearAll();
});

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
    console.log('Starting auth initialization...');
    const [token, userData] = await Promise.all([
        storage.getAuthToken(),
        storage.getUserData(),
    ]);
    console.log('Stored auth data:', { token, userData });

    if (!token || !userData) {
        console.log('No stored auth data found');
        return { token: null, user: null };
    }

    // 토큰이 있으면 API 클라이언트에 설정하고 최신 사용자 정보 가져오기
    if (token) {
        authService.setToken(token);
        try {
            const currentUser = await authService.getCurrentUser();
            // 최신 사용자 정보 저장
            await storage.setUserData(currentUser);
            return { token, user: currentUser };
        } catch (error) {
            console.error('Failed to get current user:', error);
            return { token, user: userData }; // 에러 시 저장된 데이터 사용
        }
    }

    return { token, user: userData };
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        clearCredentials: (state) => {
            state.token = null;
            state.user = null;
            state.isAuthenticated = false;
        },
        setUser: (state, action: PayloadAction<User | null>) => {
            state.user = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '로그인 실패';
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '회원가입 실패';
            })
            // Logout
            .addCase(logoutAsync.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            // Initialize Auth
            .addCase(initializeAuth.fulfilled, (state, action) => {
                console.log('Initialize auth fulfilled:', action.payload);
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = !!action.payload.token;
                console.log('New state:', state);
            });
    },
});

export const { setCredentials, clearCredentials, setUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
