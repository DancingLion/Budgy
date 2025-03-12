import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { accountService } from '@api/services/accountService';
import { RootState } from '../index';
import { fetchTransactions } from './transactionSlice';

interface Account {
    id: string;
    name: string;
    type: string;
    subtype: string;
    balance: number;
    availableBalance?: number | null;
    mask?: string;
    official_name?: string;
    account_id?: string;
    balances?: any;
    userId?: string;
    plaidAccountId: string;
    persistent_account_id?: string;
    lastUpdated: Date;
}

interface AccountState {
    accounts: Account[];
    loading: boolean;
    error: string | null;
    linkToken: string | null;
    accessToken: string | null;
    selectedAccountId: string | null;
}

const initialState: AccountState = {
    accounts: [],
    loading: false,
    error: null,
    linkToken: null,
    accessToken: null,
    selectedAccountId: null,
};

// Async Thunks
export const createLinkToken = createAsyncThunk(
    'accounts/createLinkToken',
    async () => {
        const linkToken = await accountService.createLinkToken();
        return linkToken;
    }
);

export const exchangePublicToken = createAsyncThunk(
    'accounts/exchangePublicToken',
    async (publicToken: string) => {
        const accessToken = await accountService.exchangePublicToken(publicToken);
        return accessToken;
    }
);

export const fetchPlaidAccounts = createAsyncThunk(
    'accounts/fetchPlaidAccounts',
    async (_, { dispatch, getState }) => {
        const state = getState() as RootState;
        const userId = state.auth.user?.id;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await accountService.getAccounts();

            if (!response || !Array.isArray(response)) {
                throw new Error('Invalid accounts data structure');
            }

            // 각 계좌 저장
            for (const account of response) {
                await accountService.saveAccount({
                    ...account,
                    userId,
                    plaidAccountId: account.account_id,
                    persistent_account_id: account.persistent_account_id || null,
                    balance: account.balances?.current || 0,
                    availableBalance: account.balances?.available || null
                });
            }

            return response;
        } catch (error) {
            console.error('Error in fetchPlaidAccounts:', error);
            throw error;
        }
    }
);

export const fetchLocalAccounts = createAsyncThunk(
    'accounts/fetchLocalAccounts',
    async () => {
        const accounts = await accountService.getLocalAccounts();
        return accounts;
    }
);

export const saveAccount = createAsyncThunk(
    'accounts/saveAccount',
    async (accountData: any) => {
        const savedAccount = await accountService.saveAccount(accountData);
        return savedAccount;
    }
);

export const deleteAccount = createAsyncThunk(
    'accounts/deleteAccount',
    async (accountId: string) => {
        await accountService.deleteAccount(accountId);
        return accountId;
    }
);

export const linkBankAccount = createAsyncThunk(
    'accounts/linkBankAccount',
    async (publicToken: string, { dispatch }) => {
        try {
            await accountService.exchangePublicToken(publicToken);
            await accountService.getAccounts();  // 계좌 정보 업데이트
            await dispatch(fetchTransactions());  // 거래내역 가져오기
            return true;
        } catch (error) {
            console.error('Error linking bank account:', error);
            throw error;
        }
    }
);

// updateAccount action 추가
export const updateAccount = createAsyncThunk(
    'accounts/updateAccount',
    async (accountData: any) => {
        const updatedAccount = await accountService.updateAccount(accountData);
        return updatedAccount;
    }
);

const accountSlice = createSlice({
    name: 'accounts',
    initialState,
    reducers: {
        setAccounts: (state, action: PayloadAction<Account[]>) => {
            state.accounts = action.payload;
        },
        addAccount: (state, action: PayloadAction<Account>) => {
            state.accounts.push(action.payload);
        },
        updateAccountBalance: (state, action: PayloadAction<{ accountId: string; balance: number }>) => {
            const account = state.accounts.find(acc => acc.id === action.payload.accountId);
            if (account) {
                account.balance = action.payload.balance;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setSelectedAccount: (state, action: PayloadAction<string | null>) => {
            state.selectedAccountId = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Link Token
            .addCase(createLinkToken.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createLinkToken.fulfilled, (state, action) => {
                state.loading = false;
                state.linkToken = action.payload;
            })
            .addCase(createLinkToken.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Link 토큰 생성 실패';
            })
            // Exchange Public Token
            .addCase(exchangePublicToken.fulfilled, (state, action) => {
                state.accessToken = action.payload;
            })
            // Fetch Plaid Accounts
            .addCase(fetchPlaidAccounts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPlaidAccounts.fulfilled, (state, action) => {
                // 상태 업데이트는 fetchLocalAccounts를 통해 처리
                state.loading = false;
            })
            .addCase(fetchPlaidAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch Plaid accounts';
            })
            // Fetch Local Accounts
            .addCase(fetchLocalAccounts.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLocalAccounts.fulfilled, (state, action) => {
                state.loading = false;
                state.accounts = action.payload;
            })
            .addCase(fetchLocalAccounts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || '계좌 정보 조회 실패';
            })
            // Save Account
            .addCase(saveAccount.fulfilled, (state, action) => {
                // headers 제거하고 필요한 데이터만 저장
                const { headers, ...accountData } = action.payload;

                // 기존 계정이 있는지 확인
                const existingIndex = state.accounts.findIndex(
                    acc => acc.plaidAccountId === accountData.data.plaidAccountId
                );

                if (existingIndex >= 0) {
                    state.accounts[existingIndex] = accountData.data;
                } else {
                    state.accounts.push(accountData.data);
                }

                state.loading = false;
            })
            // Delete Account
            .addCase(deleteAccount.fulfilled, (state, action) => {
                state.accounts = state.accounts.filter(
                    account => account.id !== action.payload
                );
            })
            .addCase(linkBankAccount.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(linkBankAccount.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(linkBankAccount.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to link bank account';
            })
            // Update Account
            .addCase(updateAccount.fulfilled, (state, action) => {
                const index = state.accounts.findIndex(
                    account => account.id === action.payload.id
                );
                if (index !== -1) {
                    state.accounts[index] = action.payload;
                }
            });
    },
});

export const {
    setAccounts,
    addAccount,
    updateAccountBalance,
    setLoading,
    setError,
    setSelectedAccount,
} = accountSlice.actions;

export default accountSlice.reducer;
