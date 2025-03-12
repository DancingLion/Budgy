import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../styles/theme';

interface TransactionCardProps {
    transaction: {
        id: string;
        amount: number;
        description: string;
        merchantName?: string;
        category: string;
        date: string;
        pending?: boolean;
    };
}

const IconComponent = Icon as any;

const TransactionCard = ({ transaction }: TransactionCardProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const isExpense = transaction.amount < 0;

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'Food and Drink':
            case 'food':
            case '식비':
                return 'restaurant-outline';
            case 'Travel':
            case '여행':
                return 'airplane-outline';
            case 'Shopping':
            case '쇼핑':
                return 'cart-outline';
            case 'Entertainment':
            case '오락':
                return 'game-controller-outline';
            case 'Utilities':
            case '공과금':
                return 'flash-outline';
            case 'Transport':
            case '교통':
                return 'bus-outline';
            case 'Healthcare':
            case '의료':
                return 'medical-outline';
            case 'Education':
            case '교육':
                return 'book-outline';
            default:
                return 'cash-outline';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ko-KR', {
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        }).format(date);
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'Food and Drink':
            case 'food':
            case '식비':
                return theme.colors.category.food;
            case 'Shopping':
            case '쇼핑':
                return theme.colors.category.shopping;
            case 'Transport':
            case '교통':
                return theme.colors.category.transport;
            case 'Entertainment':
            case '오락':
                return theme.colors.category.entertainment;
            case 'Utilities':
            case '공과금':
                return theme.colors.category.utilities;
            default:
                return theme.colors.category.other;
        }
    };

    return (
        <TouchableOpacity style={[
            styles.container,
            isDark && { backgroundColor: theme.colors.card.dark }
        ]}>
            <View style={styles.leftContent}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: isExpense ? theme.colors.danger + '15' : theme.colors.success + '15' }
                ]}>
                    <IconComponent
                        name={isExpense ? 'arrow-down-outline' : 'arrow-up-outline'}
                        size={24}
                        color={isExpense ? theme.colors.danger : theme.colors.success}
                    />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[
                        styles.description,
                        isDark && { color: theme.colors.text.dark.primary }
                    ]} numberOfLines={1}>
                        {transaction.merchantName || transaction.description}
                    </Text>
                    <View style={styles.detailsContainer}>
                        {transaction.category && (
                            <View style={[
                                styles.categoryContainer,
                                isDark && { backgroundColor: theme.colors.background.dark }
                            ]}>
                                <Text style={[
                                    styles.category,
                                    isDark && { color: theme.colors.text.dark.secondary }
                                ]}>{transaction.category}</Text>
                            </View>
                        )}
                        <Text style={[
                            styles.date,
                            isDark && { color: theme.colors.text.dark.secondary }
                        ]}>{formatDate(transaction.date)}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.rightContent}>
                <Text style={[
                    styles.amount,
                    { color: isExpense ? theme.colors.danger : theme.colors.success }
                ]}>
                    {isExpense ? '-' : '+'}
                    {Math.abs(transaction.amount).toLocaleString('ko-KR')}원
                </Text>
                {transaction.pending && (
                    <View style={styles.pendingContainer}>
                        <Text style={styles.pendingText}>처리 중</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.card.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        ...theme.shadows.sm,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    textContainer: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    description: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
        fontWeight: '500' as const,
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.xs,
    },
    categoryContainer: {
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        alignSelf: 'flex-start',
    },
    category: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
    },
    date: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
    },
    rightContent: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '600' as const,
    },
    pendingContainer: {
        backgroundColor: theme.colors.warning + '20',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.full,
        marginTop: theme.spacing.xs,
    },
    pendingText: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.warning,
        fontWeight: '500' as const,
    },
});

export default TransactionCard; 