import axios from 'axios';
import { store } from '@store/index';
import { Platform } from 'react-native';
import { storage } from '../utils/storage';

const PLAID_BASE_URL = 'https://sandbox.plaid.com';  // 개발 환경에서는 sandbox URL 사용

export const plaidClient = axios.create({
    baseURL: PLAID_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
    },
});


//const API_URL = Platform.select({
//    ios: 'http://192.168.1.108:3000',  // 실제 기기 테스트를 위한 IP
//    android: 'http://192.168.1.108:3000',  // 실제 기기 테스트를 위한 IP
//}) || 'http://192.168.1.108:3000';

// ngrok URL 사용
const API_URL = 'https://1d50-2600-1700-7a-7000-d4a1-c509-d4f8-7db0.ngrok-free.app';
// API URL 디버깅
console.log('Current API URL:', API_URL);
console.log('Current Platform:', Platform.OS);

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 5000,  // 타임아웃 설정 추가
});

// 요청 인터셉터: 토큰 추가
apiClient.interceptors.request.use(
    async (config) => {
        const token = await storage.getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.log('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            // 인증 에러 시 로그아웃
            await storage.clearAll();
            store.dispatch({ type: 'auth/clearCredentials' });
        }
        return Promise.reject(error);
    }
);
