import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '@styles/theme';
import DashboardScreen from '@screens/dashboard/DashboardScreen';
import TransactionListScreen from '@screens/transactions/TransactionListScreen';
import AccountListScreen from '@screens/accounts/AccountListScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const IconComponent = Icon as any;

const TabNavigator = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: true,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary,
                tabBarStyle: {
                    paddingBottom: Platform.OS === 'ios' ? 20 : 5,
                    paddingTop: 5,
                    height: Platform.OS === 'ios' ? 85 : 60,
                    backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.primary,
                    borderTopColor: isDark ? theme.colors.border.dark : theme.colors.border.light,
                    ...Platform.select({
                        ios: {
                            shadowColor: theme.colors.shadow,
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        },
                        android: {
                            elevation: 8,
                        },
                    }),
                },
                tabBarHideOnKeyboard: true,
                headerStyle: {
                    backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.primary,
                    borderBottomWidth: 1,
                    borderBottomColor: isDark ? theme.colors.border.dark : theme.colors.border.light,
                    ...Platform.select({
                        ios: {
                            shadowColor: theme.colors.shadow,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        },
                        android: {
                            elevation: 4,
                        },
                    }),
                },
                headerTitleStyle: {
                    color: isDark ? theme.colors.text.dark.primary : theme.colors.text.primary,
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: '600',
                },
                tabBarLabelStyle: {
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: '500',
                },
                tabBarItemStyle: {
                    padding: theme.spacing.sm,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    title: '대시보드',
                    tabBarLabel: '대시보드',
                    tabBarIcon: ({ color, size }) => (
                        <IconComponent name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Transactions"
                component={TransactionListScreen}
                options={{
                    title: '거래내역',
                    tabBarLabel: '거래내역',
                    tabBarIcon: ({ color, size }) => (
                        <IconComponent name="list-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Accounts"
                component={AccountListScreen}
                options={{
                    title: '계좌',
                    tabBarLabel: '계좌',
                    tabBarIcon: ({ color, size }) => (
                        <IconComponent name="wallet-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    title: '프로필',
                    tabBarLabel: '프로필',
                    tabBarIcon: ({ color, size }) => (
                        <IconComponent name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;
