import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    AUTH_TOKEN: '@auth_token',
    USER_DATA: '@user_data',
    PLAID_ACCESS_TOKEN: '@plaid_access_token',
};

export const storage = {
    // 인증 토큰 저장
    async setAuthToken(token: string) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
        } catch (error) {
            console.error('Error saving auth token:', error);
        }
    },

    // 인증 토큰 가져오기
    async getAuthToken() {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    },

    // 사용자 데이터 저장
    async setUserData(userData: any) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    },

    // 사용자 데이터 가져오기
    async getUserData() {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    },

    // Plaid Access 토큰 저장
    async setPlaidAccessToken(token: string) {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.PLAID_ACCESS_TOKEN, token);
        } catch (error) {
            console.error('Error saving Plaid access token:', error);
        }
    },

    // Plaid Access 토큰 가져오기
    async getPlaidAccessToken() {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.PLAID_ACCESS_TOKEN);
        } catch (error) {
            console.error('Error getting Plaid access token:', error);
            return null;
        }
    },

    // 모든 데이터 삭제 (로그아웃 시 사용)
    async clearAll() {
        try {
            await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA]);
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    },

    async setItem(key: string, value: any) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving data', error);
        }
    },

    async getItem(key: string) {
        try {
            const item = await AsyncStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading data', error);
            return null;
        }
    },

    async removeItem(key: string) {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing data', error);
        }
    },

    async clear() {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error clearing data', error);
        }
    }
}; 