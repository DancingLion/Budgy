import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@store/index';
import { syncTransactions, updateAccountBalances, fetchTransactions } from '@store/slices/transactionSlice';
import { storage } from '@utils/storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiClient } from '@api/client';
import Toast from 'react-native-toast-message';
import theme from '@styles/theme';

const IconComponent = Icon as any;

const TransactionSync = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { syncing, lastSyncTime, syncError } = useSelector(
        (state: RootState) => state.transactions
    );
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // 15분마다 자동 동기화
    useEffect(() => {
        const syncInterval = setInterval(() => {
            handleSync();
        }, 15 * 60 * 1000);

        return () => clearInterval(syncInterval);
    }, []);

    const handleSync = useCallback(async () => {
        try {
            // 계좌 연결 상태 확인
            const accounts = await apiClient.get('/api/accounts');
            if (!accounts.data || accounts.data.length === 0) {
                Toast.show({
                    type: 'info',
                    text1: '알림',
                    text2: '먼저 계좌를 연결해주세요.',
                    position: 'bottom',
                    visibilityTime: 3000
                });
                return;
            }

            await dispatch(syncTransactions()).unwrap();
            await dispatch(updateAccountBalances()).unwrap();
            await dispatch(fetchTransactions());
            Toast.show({
                type: 'success',
                text1: '동기화 완료',
                text2: '거래내역이 성공적으로 동기화되었습니다.',
                position: 'bottom',
                visibilityTime: 2000
            });
        } catch (error: any) {
            console.error('Sync failed:', error);
            Toast.show({
                type: 'error',
                text1: '동기화 실패',
                text2: error.response?.data?.error || '거래내역 동기화에 실패했습니다.',
                position: 'bottom',
                visibilityTime: 3000
            });
        }
    }, [dispatch]);

    return (
        <View style={[
            styles.container,
            isDark && { backgroundColor: theme.colors.card.dark }
        ]}>
            <TouchableOpacity
                style={[
                    styles.syncButton,
                    isDark && { backgroundColor: theme.colors.background.dark }
                ]}
                onPress={handleSync}
                disabled={syncing}
            >
                <IconComponent
                    name={syncing ? 'sync-outline' : 'refresh-outline'}
                    size={24}
                    color={theme.colors.primary}
                    style={[styles.icon, syncing && styles.spinning]}
                />
                <Text style={[
                    styles.syncText,
                    isDark && { color: theme.colors.text.dark.primary }
                ]}>
                    {syncing ? '동기화 중...' : '지금 동기화'}
                </Text>
            </TouchableOpacity>
            {lastSyncTime && (
                <Text style={[
                    styles.lastSync,
                    isDark && { color: theme.colors.text.dark.secondary }
                ]}>
                    마지막 동기화: {new Date(lastSyncTime).toLocaleString()}
                </Text>
            )}
            {syncError && <Text style={[
                styles.error,
                isDark && { color: theme.colors.danger }
            ]}>{syncError}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.card.primary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    spinning: {
        transform: [{ rotate: '360deg' }],
    },
    syncText: {
        marginLeft: theme.spacing.sm,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
    },
    lastSync: {
        marginTop: theme.spacing.sm,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
    },
    error: {
        marginTop: theme.spacing.sm,
        color: theme.colors.danger,
        fontSize: theme.typography.sizes.sm,
    },
});

export default TransactionSync; 