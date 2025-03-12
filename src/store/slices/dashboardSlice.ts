import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
    balance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    loading: boolean;
    error: string | null;
}

const initialState: DashboardState = {
    balance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        setBalance: (state, action: PayloadAction<number>) => {
            state.balance = action.payload;
        },
        setMonthlyIncome: (state, action: PayloadAction<number>) => {
            state.monthlyIncome = action.payload;
        },
        setMonthlyExpense: (state, action: PayloadAction<number>) => {
            state.monthlyExpense = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setBalance,
    setMonthlyIncome,
    setMonthlyExpense,
    setLoading,
    setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer; 