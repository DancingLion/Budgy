import { plaidClient, apiClient } from '../client';
import { PLAID_ENDPOINTS, API_ENDPOINTS } from '../endpoints';
import { Platform } from 'react-native';

interface PlaidAccount {
    account_id: string;
    balances: {
        available: number;
        current: number;
        iso_currency_code: string;
    };
    mask: string;
    name: string;
    official_name: string;
    type: string;
    subtype: string;
    id: string;
    userId: string;
    balance: number;
    availableBalance: number | null;
    persistent_account_id: string;
    plaidAccountId?: string;
}

const accountService = {
    // Plaid Link 토큰 생성
    createLinkToken: async () => {
        try {
            console.log('Calling create-link-token endpoint...');
            const response = await apiClient.post('/api/plaid/create-link-token', {
                platform: Platform.OS,
                client_name: 'BudgetTracker',
                products: ['auth', 'transactions'],
                country_codes: ['US'],
                language: 'ko'
            });
            console.log('Link token response:', response.data);
            return response.data.link_token;
        } catch (error) {
            console.error('Error details:', {
                config: (error as any).config,
                response: (error as any).response?.data
            });
            throw error;
        }
    },

    // Public 토큰을 Access 토큰으로 교환
    exchangePublicToken: async (publicToken: string) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.plaid.exchangeToken, {
                public_token: publicToken
            });
            return response.data;
        } catch (error) {
            console.error('Error exchanging public token:', error);
            throw error;
        }
    },

    // 계좌 목록 조회
    getAccounts: async () => {
        try {
            // 먼저 access token을 가져옴
            const accessTokenResponse = await apiClient.get(API_ENDPOINTS.plaid.getAccessToken);
            const { accessToken } = accessTokenResponse.data;

            if (!accessToken) {
                throw new Error('No access token found');
            }

            const response = await apiClient.post(API_ENDPOINTS.plaid.getAccounts, {
                access_token: accessToken
            });

            return Array.isArray(response.data) ? response.data : response.data?.accounts;
        } catch (error) {
            console.error('Error getting accounts:', error);
            throw error;
        }
    },

    // 로컬 서버에 계좌 정보 저장
    saveAccount: async (accountData: any) => {
        try {
            const payload = {
                plaidAccountId: accountData.plaidAccountId || accountData.account_id,
                name: accountData.name,
                type: accountData.type,
                subtype: accountData.subtype,
                balance: accountData.balances?.current || accountData.balance || 0,
                availableBalance: accountData.balances?.available || accountData.availableBalance || 0,
                persistent_account_id: accountData.persistent_account_id || null,
                lastUpdated: new Date()
            };

            const existingAccounts = await apiClient.get(API_ENDPOINTS.accounts.getAll);
            const existingAccount = existingAccounts.data.find(
                (acc: any) => acc.plaidAccountId === payload.plaidAccountId
            );

            if (existingAccount) {
                return await apiClient.put(
                    API_ENDPOINTS.accounts.update(existingAccount.id),
                    payload
                );
            }

            return await apiClient.post(API_ENDPOINTS.accounts.create, payload);
        } catch (error) {
            console.error('Error in saveAccount:', error);
            throw error;
        }
    },

    // 계좌 목록 조회 (로컬 서버)
    getLocalAccounts: async () => {
        try {
            const response = await apiClient.get(API_ENDPOINTS.accounts.getAll);
            return response.data;
        } catch (error) {
            console.error('Error getting local accounts:', error);
            throw error;
        }
    },

    // 계좌 삭제
    deleteAccount: async (accountId: string) => {
        try {
            await apiClient.delete(API_ENDPOINTS.accounts.delete(accountId));
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    },

    updateAccount: async (accountData: any) => {
        try {
            const payload = {
                name: accountData.name,
                type: accountData.type,
                balance: accountData.balance,
                availableBalance: accountData.availableBalance,
                plaidAccountId: accountData.plaidAccountId,
                subtype: accountData.subtype,
                persistent_account_id: accountData.persistent_account_id,
                lastUpdated: new Date()
            };

            const response = await apiClient.put(
                API_ENDPOINTS.accounts.update(accountData.id),
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error updating account:', error);
            throw error;
        }
    },

    // 거래내역 동기화
    syncTransactions: async () => {
        try {
            // 직접 /api/transactions/sync 엔드포인트 호출
            const response = await apiClient.post(API_ENDPOINTS.transactions.sync);
            return response.data;
        } catch (error) {
            console.error('Error syncing transactions:', error);
            throw error;
        }
    },
};

export { accountService };
