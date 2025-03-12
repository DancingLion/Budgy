import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import dashboardReducer from './slices/dashboardSlice';
import transactionReducer from './slices/transactionSlice';
import accountReducer from './slices/accountSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        dashboard: dashboardReducer,
        transactions: transactionReducer,
        accounts: accountReducer,
        auth: authReducer,
    },
    // 개발 환경에서 Redux DevTools 활성화
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// hooks 추가
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;