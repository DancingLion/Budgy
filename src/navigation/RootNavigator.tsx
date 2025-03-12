import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { initializeAuth } from '@store/slices/authSlice';

const RootNavigator = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    useEffect(() => {
        console.log('RootNavigator 렌더링:', {
            isAuthenticated: auth.isAuthenticated,
            hasAuthNavigator: !!AuthNavigator,
            hasMainNavigator: !!MainNavigator
        });
    }, [auth.isAuthenticated]);

    return (
        <NavigationContainer>
            {auth.isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
};

export default RootNavigator; 