import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { initializeAuth } from '../store/slices/authSlice';
import TabNavigator from './TabNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    if (loading) {
        return null; // 또는 로딩 스피너를 보여줄 수 있습니다
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // 인증되지 않은 상태
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    // 인증된 상태
                    <Stack.Screen name="Main" component={TabNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};