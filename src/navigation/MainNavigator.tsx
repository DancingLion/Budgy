import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import TransactionScreen from '@screens/transactions/TransactionListScreen';
import AccountScreen from '@screens/accounts/AccountsScreen';
import DashboardScreen from '@screens/dashboard/DashboardScreen';
import ProfileScreen from '@screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const IconComponent = Icon as any;

const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string = 'list-outline';
                    switch (route.name) {
                        case '거래내역':
                            iconName = focused ? 'list' : 'list-outline';
                            break;
                        case '계좌':
                            iconName = focused ? 'wallet' : 'wallet-outline';
                            break;
                        case '프로필':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        case '대시보드':
                            iconName = focused ? 'analytics' : 'analytics-outline';
                            break;
                        default:
                            iconName = 'list-outline';
                    }
                    return <IconComponent name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="대시보드" component={DashboardScreen} />
            <Tab.Screen name="거래내역" component={TransactionScreen} />
            <Tab.Screen name="계좌" component={AccountScreen} />
            <Tab.Screen name="프로필" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default MainNavigator; 