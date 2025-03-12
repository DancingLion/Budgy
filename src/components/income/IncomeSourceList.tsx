import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../styles/theme';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const IconComponent = Icon as any;

interface IncomeSource {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    nextPaymentDate: string;
}

interface IncomeSourceListProps {
    sources: IncomeSource[];
    onDelete: (id: string) => void;
}

const getFrequencyText = (frequency: string) => {
    switch (frequency) {
        case 'WEEKLY':
            return '매주';
        case 'BIWEEKLY':
            return '2주마다';
        case 'MONTHLY':
            return '매월';
        case 'ANNUAL':
            return '매년';
        case 'ONE_TIME':
            return '1회성';
        default:
            return frequency;
    }
};

const IncomeSourceList: React.FC<IncomeSourceListProps> = ({
    sources,
    onDelete,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (sources.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={[
                    styles.emptyText,
                    isDark && styles.textDark
                ]}>
                    등록된 수입원이 없습니다.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {sources.map((source) => (
                <View
                    key={source.id}
                    style={[
                        styles.sourceItem,
                        isDark && styles.sourceItemDark
                    ]}
                >
                    <View style={styles.sourceInfo}>
                        <View style={styles.sourceHeader}>
                            <Text style={[
                                styles.sourceName,
                                isDark && styles.textDark
                            ]}>
                                {source.name}
                            </Text>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => onDelete(source.id)}
                            >
                                <IconComponent
                                    name="trash-outline"
                                    size={20}
                                    color={theme.colors.danger}
                                />
                            </TouchableOpacity>
                        </View>
                        <Text style={[
                            styles.sourceAmount,
                            isDark && styles.textDark
                        ]}>
                            ${source.amount.toLocaleString('us-US')}
                        </Text>
                        <View style={styles.sourceDetails}>
                            <View style={styles.frequencyBadge}>
                                <Text style={styles.sourceFrequency}>
                                    {getFrequencyText(source.frequency)}
                                </Text>
                            </View>
                            <Text style={[
                                styles.sourceDate,
                                isDark && styles.textDark
                            ]}>
                                다음 지급일: {format(new Date(source.nextPaymentDate), 'PPP', { locale: ko })}
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    sourceItem: {
        padding: 16,
        backgroundColor: 'white',
        marginBottom: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    sourceItemDark: {
        backgroundColor: theme.colors.background.dark,
    },
    sourceInfo: {
        flex: 1,
    },
    sourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sourceName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    sourceAmount: {
        fontSize: 24,
        color: theme.colors.primary,
        marginBottom: 12,
    },
    sourceDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    frequencyBadge: {
        backgroundColor: theme.colors.primary + '15',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
        marginBottom: 4,
    },
    sourceFrequency: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    sourceDate: {
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    deleteButton: {
        padding: 4,
    },
    textDark: {
        color: theme.colors.text.inverse,
    },
});

export default IncomeSourceList; 