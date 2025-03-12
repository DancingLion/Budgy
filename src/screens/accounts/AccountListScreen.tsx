import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Button, Alert, Text, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import { fetchLocalAccounts } from '@store/slices/accountSlice';
import { syncTransactions } from '@store/slices/transactionSlice';
import PlaidLinkComponent from '@components/plaid/PlaidLink';
import AccountCard from '@components/accounts/AccountCard';
import { LoadingSpinner, ErrorMessage } from '@components/common';
import theme from '../../styles/theme';
import Icon from 'react-native-vector-icons/Ionicons';

const IconComponent = Icon as any;

const AccountListScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { accounts, loading, error } = useSelector(
        (state: RootState) => state.accounts
    );
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        dispatch(fetchLocalAccounts());
    }, [dispatch]);

    const handleSync = async () => {
        try {
            await dispatch(syncTransactions()).unwrap();
            // 동기화 후 계좌 정보 새로고침
            dispatch(fetchLocalAccounts());
            Alert.alert('성공', '거래내역이 성공적으로 동기화되었습니다.');
        } catch (error) {
            console.error('Sync failed:', error);
            Alert.alert('실패', '거래내역 동기화에 실패했습니다.');
        }
    };

    // 디버깅용 로그
    console.log('Current accounts:', accounts);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    const renderAccount = ({ item }: any) => (
        <TouchableOpacity style={[
            styles.accountCard,
            isDark && { backgroundColor: theme.colors.card.dark }
        ]}>
            <View style={styles.accountInfo}>
                <View style={styles.iconContainer}>
                    <IconComponent
                        name={item.type === 'savings' ? 'save-outline' : 'card-outline'}
                        size={24}
                        color={theme.colors.primary}
                    />
                </View>
                <View style={styles.accountTextContainer}>
                    <Text style={[
                        styles.accountName,
                        isDark && { color: theme.colors.text.dark.primary }
                    ]}>{item.name}</Text>
                    <Text style={[
                        styles.accountType,
                        isDark && { color: theme.colors.text.dark.secondary }
                    ]}>{item.type}</Text>
                </View>
            </View>
            <View style={styles.balanceInfo}>
                <Text style={[
                    styles.balanceAmount,
                    isDark && { color: theme.colors.text.dark.primary }
                ]}>
                    ₩{item.balance.toLocaleString()}
                </Text>
                {item.availableBalance && (
                    <Text style={[
                        styles.availableBalance,
                        isDark && { color: theme.colors.text.dark.secondary }
                    ]}>
                        사용 가능: ₩{item.availableBalance.toLocaleString()}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[
            styles.container,
            isDark && { backgroundColor: theme.colors.background.dark }
        ]}>
            <View style={styles.header}>
                <PlaidLinkComponent />
                <Button
                    title="거래내역 동기화"
                    onPress={handleSync}
                />
            </View>
            <FlatList
                data={accounts}
                keyExtractor={(item) => item.id}
                renderItem={renderAccount}
                contentContainerStyle={[
                    styles.listContainer,
                    isDark && { backgroundColor: theme.colors.background.dark }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listContainer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
    },
    accountCard: {
        backgroundColor: theme.colors.card.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    accountInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    accountTextContainer: {
        flex: 1,
    },
    accountName: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    accountType: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
    },
    balanceInfo: {
        marginTop: theme.spacing.sm,
    },
    balanceAmount: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '700',
        color: theme.colors.text.primary,
    },
    availableBalance: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
});

export default AccountListScreen;