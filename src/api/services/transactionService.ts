import { plaidClient, apiClient } from '../client';
import { PLAID_ENDPOINTS, API_ENDPOINTS } from '../endpoints';
import { storage } from '@utils/storage';
import { convertPlaidToAppCategory } from '@components/transactions/TransactionFilters';

interface PlaidTransaction {
    transaction_id: string;
    account_id: string;
    amount: number;
    date: string;
    name: string;
    merchant_name: string;
    category: string[];
    pending: boolean;
    payment_channel: string;
    personal_finance_category: {
        primary: string;
        detailed: string;
        confidence_level: string;
    };
}

export const transactionService = {
    // Plaid에서 거래 내역 가져오기
    getPlaidTransactions: async (accessToken: string, startDate: string, endDate: string) => {
        try {
            const response = await plaidClient.post(PLAID_ENDPOINTS.getTransactions, {
                access_token: accessToken,
                start_date: startDate,
                end_date: endDate,
                options: {
                    count: 100,
                    offset: 0,
                },
            });
            console.log('Plaid transaction details:', response.data.transactions.map((t: any) => ({
                name: t.name,
                category: t.category,
                personal_finance_category: t.personal_finance_category,
                converted: convertPlaidToAppCategory(t.personal_finance_category.primary)
            })));
            return response.data.transactions;
        } catch (error) {
            console.error('Error getting Plaid transactions:', error);
            throw error;
        }
    },

    // 로컬 서버에 거래 내역 저장
    saveTransaction: async (transactionData: PlaidTransaction) => {
        try {
            const response = await apiClient.post(API_ENDPOINTS.transactions.create, {
                plaidTransactionId: transactionData.transaction_id,
                accountId: transactionData.account_id,
                amount: transactionData.amount,
                date: transactionData.date,
                description: transactionData.name,
                merchantName: transactionData.merchant_name,
                category: convertPlaidToAppCategory(transactionData.personal_finance_category.primary),
                pending: transactionData.pending,
            });
            return response.data;
        } catch (error) {
            console.error('Error saving transaction:', error);
            throw error;
        }
    },

    // 로컬 거래 내역 조회
    getLocalTransactions: async (params?: {
        startDate?: Date;
        endDate?: Date;
        category?: string;
    }) => {
        try {
            const queryParams = new URLSearchParams();

            if (params?.startDate) {
                queryParams.append('startDate', params.startDate.toISOString());
            }
            if (params?.endDate) {
                queryParams.append('endDate', params.endDate.toISOString());
            }
            if (params?.category) {
                queryParams.append('category', params.category);
            }

            console.log('API request URL params:', queryParams.toString());
            const url = `${API_ENDPOINTS.transactions.list}?${queryParams.toString()}`;
            console.log('Requesting URL:', url);
            const response = await apiClient.get(url);
            console.log('API response categories:', response.data.map((t: any) => t.category));
            console.log('Full API response:', JSON.stringify(response.data, null, 2));
            return response.data;
        } catch (error) {
            console.error('Error getting local transactions:', error);
            throw error;
        }
    },

    // 거래 내역 업데이트
    updateTransaction: async (transactionId: string, updateData: {
        amount?: number;
        description?: string;
        merchantName?: string;
        category?: string;
        date?: string;
        pending?: boolean;
    }) => {
        try {
            const response = await apiClient.put(
                API_ENDPOINTS.transactions.update(transactionId),
                updateData
            );
            return response.data;
        } catch (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
    },

    // 거래 내역 삭제
    deleteTransaction: async (transactionId: string) => {
        try {
            await apiClient.delete(API_ENDPOINTS.transactions.delete(transactionId));
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    // 카테고리별 거래 내역 통계
    getTransactionStats: async (startDate: string, endDate: string) => {
        try {
            const response = await apiClient.get(`${API_ENDPOINTS.transactions.list}/stats`, {
                params: { startDate, endDate },
            });
            return response.data;
        } catch (error) {
            console.error('Error getting transaction stats:', error);
            throw error;
        }
    },

    // 거래내역 동기화
    async syncTransactions() {
        try {
            const response = await apiClient.post(API_ENDPOINTS.transactions.sync);
            console.log('Sync response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error syncing transactions:', error);
            throw error;
        }
    },

    // 계좌 잔액 업데이트
    updateAccountBalances: async (accessToken: string) => {
        try {
            const response = await plaidClient.post(PLAID_ENDPOINTS.getAccounts, {
                access_token: accessToken,
            });

            // 로컬 DB 업데이트
            await apiClient.post(API_ENDPOINTS.accounts.updateBalances, {
                accounts: response.data.accounts,
            });

            return response.data.accounts;
        } catch (error) {
            console.error('Error updating account balances:', error);
            throw error;
        }
    },
};
