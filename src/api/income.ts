import { apiClient } from './client';

export interface IncomeSource {
    id: string;
    name: string;
    amount: number;
    frequency: 'ONE_TIME' | 'MONTHLY' | 'BIWEEKLY' | 'WEEKLY' | 'ANNUAL';
    nextPaymentDate: string;
    isActive: boolean;
}

export interface IncomeTransaction {
    id: string;
    incomeSourceId?: string;
    amount: number;
    date: string;
    description?: string;
    isAutoGenerated: boolean;
    incomeSource?: IncomeSource;
}

// 수입원 관리 API
export const incomeApi = {
    // 수입원 추가
    createIncomeSource: async (data: Omit<IncomeSource, 'id' | 'isActive'>) => {
        const response = await apiClient.post('/api/income/sources', data);
        return response.data;
    },

    // 수입원 목록 조회
    getIncomeSources: async () => {
        const response = await apiClient.get('/api/income/sources');
        return response.data as IncomeSource[];
    },

    // 수입원 삭제
    deleteIncomeSource: async (id: string) => {
        const response = await apiClient.delete(`/api/income/sources/${id}`);
        return response.data;
    },

    // 수입 내역 추가
    createIncomeTransaction: async (data: {
        incomeSourceId?: string;
        amount: number;
        date: string;
        description?: string;
    }) => {
        const response = await apiClient.post('/api/income/transactions', data);
        return response.data;
    },

    // 수입 내역 조회
    getIncomeTransactions: async (params?: {
        startDate?: string;
        endDate?: string;
    }) => {
        const response = await apiClient.get('/api/income/transactions', { params });
        return response.data as IncomeTransaction[];
    },

    // 자동 수입 업데이트 트리거
    triggerAutoUpdate: async () => {
        const response = await apiClient.post('/api/income/auto-update');
        return response.data;
    },

    // 총 수입 계산 및 업데이트
    updateTotalIncome: async () => {
        try {
            const response = await apiClient.post('/api/income/total-update');
            return response.data;
        } catch (error) {
            console.error('Error updating total income:', error);
            throw error;
        }
    },

    // 총 수입 조회
    getTotalIncome: async () => {
        try {
            const response = await apiClient.get('/api/income/total');
            return response.data;
        } catch (error) {
            console.error('Error getting total income:', error);
            throw error;
        }
    }
}; 