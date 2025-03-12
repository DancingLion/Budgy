import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Theme } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';
import { useSelector } from 'react-redux';

const Stack = createNativeStackNavigator();

const NavigationTheme: Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#007AFF',
        background: '#f5f5f5',
        card: '#FFFFFF',
        text: '#000000',
        border: '#E5E5E5',
        notification: '#FF3B30',
    },
};

const AppNavigator = () => {
    const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);

    return (
        <NavigationContainer theme={NavigationTheme}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: {
                        backgroundColor: NavigationTheme.colors.background,
                    },
                }}
            >
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : (
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;

