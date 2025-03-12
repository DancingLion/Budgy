import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Card } from '../../components/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import theme from '../../styles/theme';
import { incomeApi } from '../../api/income';
import { setMonthlyIncome } from '../../store/slices/dashboardSlice';

const IconComponent = Icon as any;
const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
    const dispatch = useDispatch();
    const { accounts, loading: accountsLoading } = useSelector((state: RootState) => state.accounts);
    const { transactions, loading: transactionsLoading } = useSelector((state: RootState) => state.transactions);
    const { monthlyIncome } = useSelector((state: RootState) => state.dashboard);
    const { user } = useSelector((state: RootState) => state.auth);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [selectedPeriod, setSelectedPeriod] = useState('1W');

    // 총 수입 조회
    useEffect(() => {
        const fetchTotalIncome = async () => {
            try {
                const totalIncome = await incomeApi.getTotalIncome();
                dispatch(setMonthlyIncome(totalIncome.monthlyIncome));
            } catch (error) {
                console.error('Error fetching total income:', error);
            }
        };
        fetchTotalIncome();
    }, [dispatch]);

    // 카테고리별 지출 데이터 계산
    const categoryData = useMemo(() => {
        if (!transactions) return [];

        // 카테고리 매핑 및 색상 정의
        const CATEGORY_MAPPING: { [key: string]: { name: string; color: string } } = {
            'Food and Drink': { name: 'Food and Drink', color: '#6B5ECD' },
            'Payment': { name: 'Payment', color: '#9966FF' },
            'Travel': { name: 'Travel', color: '#FF6B8A' },
            'Shopping': { name: 'Shopping', color: '#FF9F40' },
            'Entertainment': { name: 'Entertainment', color: '#FFC940' },
            'Utilities': { name: 'Utilities', color: '#4CAF50' },
            'Medical': { name: 'Medical', color: '#2196F3' },
            'Education': { name: 'Education', color: '#FF5722' },
            'Transfer': { name: 'Transfer', color: '#607D8B' },
            'Other': { name: '기타', color: '#9E9E9E' }
        };

        const categoryExpenses = transactions
            .filter((t: any) => t.amount > 0)
            .reduce((acc: { [key: string]: number }, t: any) => {
                const category = t.category || 'Other';
                acc[category] = (acc[category] || 0) + t.amount;
                return acc;
            }, {});

        const totalExpense = Object.values(categoryExpenses).reduce((sum, amount) => sum + amount, 0);

        return Object.entries(categoryExpenses)
            .map(([category, amount]) => {
                const mappedCategory = CATEGORY_MAPPING[category] || CATEGORY_MAPPING['Other'];
                return {
                    name: mappedCategory.name,
                    amount,
                    percentage: ((amount / totalExpense) * 100).toFixed(1),
                    color: mappedCategory.color,
                    legendFontColor: isDark ? '#FFFFFF' : '#000000',
                    legendFontSize: 12
                };
            })
            .sort((a, b) => b.amount - a.amount);
    }, [transactions, isDark]);

    // 월별 지출 추이 데이터 계산
    const monthlyExpenseData = useMemo(() => {
        if (!transactions) return {
            labels: [],
            datasets: [{ data: [] }]
        };

        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            return date;
        });

        const monthlyTotals = last6Months.map(date => {
            const monthTotal = transactions
                .filter((t: any) => {
                    const tDate = new Date(t.date);
                    return tDate.getMonth() === date.getMonth() &&
                        tDate.getFullYear() === date.getFullYear() &&
                        t.amount > 0;
                })
                .reduce((sum: number, t: any) => sum + t.amount, 0);
            return monthTotal;
        });

        return {
            labels: last6Months.map(date => `${date.getMonth() + 1}월`),
            datasets: [{
                data: monthlyTotals,
                color: () => isDark ? '#FFFFFF' : '#000000',
                strokeWidth: 2
            }]
        };
    }, [transactions, isDark]);

    // 이번 달 수입/지출 계산
    const monthlyStats = useMemo(() => {
        if (!transactions) return { income: 0, expense: 0 };

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const monthlyTransactions = transactions.filter((t: any) => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const income = monthlyTransactions
            .filter((t: any) => t.amount < 0)
            .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

        const expense = monthlyTransactions
            .filter((t: any) => t.amount > 0)
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        return { income, expense };
    }, [transactions]);

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    if (accountsLoading || transactionsLoading) {
        return (
            <View style={[styles.loadingContainer, isDark && { backgroundColor: theme.colors.background.dark }]}>
                <IconComponent name="refresh" size={24} color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, isDark && { backgroundColor: theme.colors.background.dark }]}>
            {/* 수입/지출 요약 카드 */}
            <View style={styles.summaryContainer}>
                <Card variant="elevated" style={[
                    styles.summaryCard,
                    isDark ? { backgroundColor: theme.colors.card.dark } : {}
                ] as any}>
                    <Text style={[styles.summaryTitle, isDark && styles.textDark]}>총 수입</Text>
                    <Text style={[styles.summaryAmount, { color: theme.colors.success }]}>
                        {formatCurrency(monthlyIncome)}
                    </Text>
                </Card>

                <Card variant="elevated" style={[
                    styles.summaryCard,
                    isDark ? { backgroundColor: theme.colors.card.dark } : {}
                ] as any}>
                    <Text style={[styles.summaryTitle, isDark && styles.textDark]}>총 지출</Text>
                    <Text style={[styles.summaryAmount, { color: theme.colors.danger }]}>
                        {formatCurrency(monthlyStats.expense)}
                    </Text>
                </Card>
            </View>

            {/* 카테고리별 지출 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>카테고리별 지출</Text>
                <Card variant="elevated" style={[
                    styles.chartCard,
                    isDark ? { backgroundColor: theme.colors.card.dark } : {}
                ] as any}>
                    <View style={styles.pieChartContainer}>
                        <PieChart
                            data={categoryData}
                            width={screenWidth - theme.spacing.md * 4}
                            height={180}
                            chartConfig={{
                                color: () => isDark ? '#FFFFFF' : '#000000',
                                labelColor: () => isDark ? '#FFFFFF' : '#000000',
                            }}
                            accessor="amount"
                            backgroundColor="transparent"
                            paddingLeft="0"
                            center={[0, 0]}
                            hasLegend={false}
                            absolute
                        />
                    </View>
                    <View style={styles.categoryList}>
                        {categoryData.map((item, index) => (
                            <View key={item.name} style={styles.categoryItem}>
                                <View style={styles.categoryHeader}>
                                    <View style={styles.categoryNameContainer}>
                                        <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                                        <Text style={[styles.categoryName, isDark && styles.textDark]}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    <Text style={[styles.categoryAmount, isDark && styles.textDark]}>
                                        {formatCurrency(item.amount)}
                                    </Text>
                                </View>
                                <Text style={[styles.categoryPercentage, isDark && styles.textSecondaryDark]}>
                                    {item.percentage}%
                                </Text>
                            </View>
                        ))}
                    </View>
                </Card>
            </View>

            {/* 최근 거래 내역 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>최근 거래</Text>
                {transactions.slice(0, 5).map((transaction: any) => (
                    <Card key={transaction.id} variant="outlined" style={[
                        styles.transactionCard,
                        isDark && { backgroundColor: theme.colors.card.dark }
                    ] as any}>
                        <View style={styles.transactionRow}>
                            <View style={styles.transactionInfo}>
                                <IconComponent
                                    name={transaction.amount < 0 ? 'arrow-down-outline' : 'arrow-up-outline'}
                                    size={24}
                                    color={transaction.amount < 0 ? theme.colors.danger : theme.colors.success}
                                />
                                <View style={styles.transactionTextContainer}>
                                    <Text style={[
                                        styles.transactionDescription,
                                        isDark && styles.textDark
                                    ]}>
                                        {transaction.description}
                                    </Text>
                                    <Text style={[
                                        styles.transactionDate,
                                        isDark && styles.textSecondaryDark
                                    ]}>{transaction.date}</Text>
                                </View>
                            </View>
                            <Text style={[
                                styles.transactionAmount,
                                { color: transaction.amount < 0 ? theme.colors.danger : theme.colors.success }
                            ]}>
                                {formatCurrency(Math.abs(transaction.amount))}
                            </Text>
                        </View>
                    </Card>
                ))}
            </View>

            {/* 지출 추이 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>지출 추이</Text>
                <Card variant="elevated" style={[
                    styles.chartCard,
                    isDark ? { backgroundColor: theme.colors.card.dark } : {}
                ] as any}>
                    <LineChart
                        data={monthlyExpenseData}
                        width={screenWidth - theme.spacing.md * 4}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.primary,
                            backgroundGradientFrom: isDark ? theme.colors.card.dark : theme.colors.card.primary,
                            backgroundGradientTo: isDark ? theme.colors.card.dark : theme.colors.card.primary,
                            decimalPlaces: 0,
                            color: () => isDark ? '#FFFFFF' : '#000000',
                            labelColor: () => isDark ? '#FFFFFF' : '#000000',
                            style: { borderRadius: 16 },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: theme.colors.primary
                            },
                            propsForBackgroundLines: {
                                strokeDasharray: "",
                                strokeWidth: 1,
                                stroke: isDark ? '#FFFFFF20' : '#00000020'
                            },
                            formatYLabel: (value) => {
                                const num = parseInt(value);
                                if (num >= 1000000) {
                                    return `${(num / 1000000)}M`;
                                } else if (num >= 1000) {
                                    return `${(num / 1000)}K`;
                                }
                                return num.toString();
                            },
                            count: 5,
                            propsForLabels: {
                                fontSize: '12'
                            }
                        }}
                        bezier
                        style={{
                            marginVertical: theme.spacing.md,
                            marginLeft: -20
                        }}
                        withVerticalLines={false}
                        withHorizontalLines={true}
                        withHorizontalLabels={true}
                        withInnerLines={true}
                        withOuterLines={false}
                        withShadow={false}
                        segments={4}
                        fromZero={true}
                    />
                </Card>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
    },
    summaryContainer: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        gap: theme.spacing.md,
    },
    summaryCard: {
        flex: 1,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.card.primary,
    },
    summaryTitle: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.sm,
    },
    summaryAmount: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: '700',
    },
    section: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    chartCard: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.card.primary,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
    },
    pieChartContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        height: 180,
    },
    categoryList: {
        marginTop: theme.spacing.md,
    },
    categoryItem: {
        marginBottom: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: theme.spacing.sm,
    },
    categoryName: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
        flex: 1,
    },
    categoryAmount: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
        fontWeight: '600',
        marginLeft: theme.spacing.sm,
    },
    categoryPercentage: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
    textDark: {
        color: theme.colors.text.dark.primary,
    },
    textSecondaryDark: {
        color: theme.colors.text.dark.secondary,
    },
    transactionCard: {
        marginBottom: theme.spacing.sm,
        backgroundColor: theme.colors.card.primary,
        padding: theme.spacing.md,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    transactionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    transactionTextContainer: {
        marginLeft: theme.spacing.sm,
        flex: 1,
    },
    transactionDescription: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
    },
    transactionDate: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
        marginTop: theme.spacing.xs,
    },
    transactionAmount: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '600',
    },
});

export default DashboardScreen;
