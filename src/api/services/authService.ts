import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData extends LoginCredentials {
    name: string;
}

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        income: number;
    };
    token: string;
}

export const authService = {
    // 로그인
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.auth.login, credentials);

            // 응답으로 받은 토큰을 헤더에 설정
            if (response.data.token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // 회원가입
    register: async (userData: RegisterData): Promise<AuthResponse> => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.auth.register, userData);

            // 회원가입 후 자동 로그인 시 토큰 설정
            if (response.data.token) {
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            }

            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    },

    // 로그아웃
    logout: async () => {
        try {
            await apiClient.post(API_ENDPOINTS.auth.logout);
            // 헤더에서 인증 토큰 제거
            delete apiClient.defaults.headers.common['Authorization'];
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    // 현재 사용자 정보 가져오기
    getCurrentUser: async (): Promise<any> => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.auth.me);
            return response.data;
        } catch (error) {
            console.error('Error getting current user:', error);
            throw error;
        }
    },

    // 비밀번호 재설정 요청
    requestPasswordReset: async (email: string) => {
        try {
            await apiClient.post('/auth/password-reset', { email });
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    },

    // 토큰 설정 (앱 시작 시 저장된 토큰이 있는 경우)
    setToken: (token: string) => {
        if (token) {
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },

    // 토큰 제거
    removeToken: () => {
        delete apiClient.defaults.headers.common['Authorization'];
    },
};
