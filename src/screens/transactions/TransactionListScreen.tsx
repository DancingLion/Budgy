import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import { fetchLocalTransactions } from '@store/slices/transactionSlice';
import TransactionCard from '@components/transactions/TransactionCard';
import TransactionFilters from '@components/transactions/TransactionFilters';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../styles/theme';

const IconComponent = Icon as any;

const TransactionListScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [currentFilters, setCurrentFilters] = useState<{
        startDate: Date | null;
        endDate: Date | null;
        category: string | null;
    }>({
        startDate: null,
        endDate: null,
        category: null
    });

    const handleSearch = async (filters: {
        startDate: Date | null;
        endDate: Date | null;
        category: string | null;
    }) => {
        try {
            setCurrentFilters(filters);
            const params: any = {};

            if (filters.startDate) {
                params.startDate = filters.startDate.toISOString();
            }
            if (filters.endDate) {
                params.endDate = filters.endDate.toISOString();
            }
            if (filters.category && filters.category !== '전체') {
                params.category = filters.category;
            }

            console.log('Sending search params:', params);
            await dispatch(fetchLocalTransactions(params)).unwrap();
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    };

    if (loading) {
        return (
            <View style={[
                styles.centerContainer,
                isDark && { backgroundColor: theme.colors.background.dark }
            ]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[
                styles.centerContainer,
                isDark && { backgroundColor: theme.colors.background.dark }
            ]}>
                <IconComponent name="alert-circle-outline" size={48} color={theme.colors.danger} />
                <Text style={[
                    styles.errorText,
                    isDark && { color: theme.colors.text.dark.primary }
                ]}>에러: {error}</Text>
            </View>
        );
    }

    const renderEmptyState = () => (
        <View style={[
            styles.centerContainer,
            isDark && { backgroundColor: theme.colors.background.dark }
        ]}>
            <IconComponent name="receipt-outline" size={48} color={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary} />
            <Text style={[
                styles.emptyText,
                isDark && { color: theme.colors.text.dark.secondary }
            ]}>거래 내역이 없습니다</Text>
        </View>
    );

    return (
        <View style={[
            styles.container,
            isDark && { backgroundColor: theme.colors.background.dark }
        ]}>
            <TransactionFilters
                onSearch={handleSearch}
                initialFilters={currentFilters}
            />
            <FlatList
                data={transactions}
                renderItem={({ item }) => <TransactionCard transaction={item} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={[
                    styles.listContainer,
                    isDark && { backgroundColor: theme.colors.background.dark }
                ]}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.xl,
    },
    listContainer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.primary,
    },
    errorText: {
        color: theme.colors.danger,
        textAlign: 'center',
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
    },
    emptyText: {
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
    },
});

export default TransactionListScreen;