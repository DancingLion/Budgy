import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '@api/services/transactionService';
import { storage } from '../../utils/storage';
import { apiClient } from '@api/client';
import { API_ENDPOINTS } from '@api/endpoints';

interface Transaction {
    id: string;
    accountId: string;
    amount: number;
    description: string;
    merchantName?: string;
    category: string;
    date: string;
    pending: boolean;
    plaidTransactionId?: string;
}

interface TransactionState {
    transactions: Transaction[];
    loading: boolean;
    error: string | null;
    stats: {
        categoryTotals: Record<string, number>;
        monthlySpending: Record<string, number>;
    } | null;
    lastSyncTime: string | null;
    syncing: boolean;
    syncError: string | null;
    filters: {
        startDate: string | null;
        endDate: string | null;
        category: string | null;
    };
}

const initialState: TransactionState = {
    transactions: [],
    loading: false,
    error: null,
    stats: null,
    lastSyncTime: null,
    syncing: false,
    syncError: null,
    filters: {
        startDate: null,
        endDate: null,
        category: null,
    },
};

// Async Thunks
export const fetchPlaidTransactions = createAsyncThunk(
    'transactions/fetchPlaidTransactions',
    async ({ accessToken, startDate, endDate }: {
        accessToken: string;
        startDate: string;
        endDate: string;
    }) => {
        const transactions = await transactionService.getPlaidTransactions(
            accessToken,
            startDate,
            endDate
        );
        return transactions;
    }
);

export const fetchLocalTransactions = createAsyncThunk(
    'transactions/fetchLocalTransactions',
    async (params?: {
        startDate?: string;
        endDate?: string;
        category?: string;
    }) => {
        try {
            console.log('Fetching transactions with params:', params); // 디버깅을 위한 로그 추가
            const transactions = await transactionService.getLocalTransactions({
                startDate: params?.startDate ? new Date(params.startDate) : undefined,
                endDate: params?.endDate ? new Date(params.endDate) : undefined,
                category: params?.category
            });
            console.log('Fetched transactions:', transactions); // 디버깅을 위한 로그 추가
            return transactions;
        } catch (error) {
            console.error('Error in fetchLocalTransactions:', error);
            throw error;
        }
    }
);

export const saveTransaction = createAsyncThunk(
    'transactions/saveTransaction',
    async (transactionData: any) => {
        const savedTransaction = await transactionService.saveTransaction(transactionData);
        return savedTransaction;
    }
);

export const updateTransaction = createAsyncThunk(
    'transactions/updateTransaction',
    async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
        const updatedTransaction = await transactionService.updateTransaction(id, data);
        return updatedTransaction;
    }
);

export const deleteTransaction = createAsyncThunk(
    'transactions/deleteTransaction',
    async (transactionId: string) => {
        await transactionService.deleteTransaction(transactionId);
        return transactionId;
    }
);

export const fetchTransactionStats = createAsyncThunk(
    'transactions/fetchStats',
    async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
        const stats = await transactionService.getTransactionStats(startDate, endDate);
        return stats;
    }
);

export const syncTransactions = createAsyncThunk(
    'transactions/syncTransactions',
    async () => {
        try {
            // access token을 요구하지 않도록 수정
            const response = await apiClient.post(API_ENDPOINTS.transactions.sync);
            return response.data;
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    }
);

export const updateAccountBalances = createAsyncThunk(
    'transactions/updateBalances',
    async () => {
        const response = await apiClient.post('/api/accounts/update-balances');
        return response.data;
    }
);

export const fetchTransactions = createAsyncThunk(
    'transactions/fetchTransactions',
    async () => {
        const response = await transactionService.getLocalTransactions();
        return response;
    }
);

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        clearTransactionError: (state) => {
            state.error = null;
        },
        setTransactions: (state, action: PayloadAction<Transaction[]>) => {
            state.transactions = action.payload;
        },
        addTransaction: (state, action: PayloadAction<Transaction>) => {
            state.transactions.push(action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setFilters: (state, action: PayloadAction<Partial<TransactionState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Plaid Transactions
            .addCase(fetchPlaidTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlaidTransactions.fulfilled, (state, action) => {
                state.loading = false;
                // payload가 undefined일 경우 빈 배열 사용
                const transactions = action.payload || [];
                const formattedTransactions = transactions.map((transaction: any) => ({
                    plaidTransactionId: transaction.transaction_id,
                    accountId: transaction.account_id,
                    amount: transaction.amount,
                    description: transaction.name,
                    merchantName: transaction.merchant_name,
                    category: transaction.category[0],
                    date: transaction.date,
                    pending: transaction.pending,
                }));
                state.transactions = formattedTransactions;
            })
            .addCase(fetchPlaidTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '거래내역 조회 실패';
            })
            // Fetch Local Transactions
            .addCase(fetchLocalTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLocalTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchLocalTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '거래내역 조회 실패';
            })
            // Save Transaction
            .addCase(saveTransaction.fulfilled, (state, action) => {
                state.transactions.push(action.payload);
            })
            // Update Transaction
            .addCase(updateTransaction.fulfilled, (state, action) => {
                const index = state.transactions.findIndex(
                    t => t.id === action.payload.id
                );
                if (index !== -1) {
                    state.transactions[index] = action.payload;
                }
            })
            // Delete Transaction
            .addCase(deleteTransaction.fulfilled, (state, action) => {
                state.transactions = state.transactions.filter(
                    t => t.id !== action.payload
                );
            })
            // Fetch Transaction Stats
            .addCase(fetchTransactionStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Sync Transactions
            .addCase(syncTransactions.pending, (state) => {
                state.syncing = true;
                state.syncError = null;
            })
            .addCase(syncTransactions.fulfilled, (state, action) => {
                state.syncing = false;
                state.transactions = action.payload?.data?.transactions || [];
                state.lastSyncTime = new Date().toISOString();
            })
            .addCase(syncTransactions.rejected, (state, action) => {
                state.syncing = false;
                state.syncError = action.error.message || '동기화 실패';
            })
            // Update Account Balances
            .addCase(updateAccountBalances.fulfilled, (state, action) => {
                console.log('Account balances updated:', action.payload);
            })
            // Fetch Transactions
            .addCase(fetchTransactions.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTransactions.fulfilled, (state, action) => {
                state.loading = false;
                state.transactions = action.payload;
            })
            .addCase(fetchTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '거래내역 조회 실패';
            });
    },
});

export const {
    clearTransactionError,
    setTransactions,
    addTransaction,
    setLoading,
    setError,
    setFilters,
} = transactionSlice.actions;

export default transactionSlice.reducer;
