import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    useColorScheme,
    Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/index';
import { clearCredentials, setCredentials, logoutAsync } from '@store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiClient } from '@api/client';
import { incomeApi } from '@api/income';
import { setMonthlyIncome } from '@store/slices/dashboardSlice';
import { Input, Button } from '../../components/common';
import IncomeSourceModal from '../../components/income/IncomeSourceModal';
import IncomeSourceList from '../../components/income/IncomeSourceList';
import theme from '../../styles/theme';
import Toast from 'react-native-toast-message';

const IconComponent = Icon as any;

interface User {
    id: string;
    email: string;
    name: string;
    income: number;
}

interface IncomeSource {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    nextPaymentDate: string;
}

const ProfileScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
    const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
    const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
    const [income, setIncome] = useState('0');
    const user = useSelector((state: RootState) => state.auth.user);
    const token = useSelector((state: RootState) => state.auth.token);
    const monthlyIncome = useSelector((state: RootState) => state.dashboard.monthlyIncome);

    // 수입원 목록 조회
    const fetchIncomeSources = async () => {
        try {
            const response = await apiClient.get('/api/income/sources');
            setIncomeSources(response.data);
        } catch (error) {
            console.error('수입원 조회 실패:', error);
            Toast.show({
                type: 'error',
                text1: '수입원 조회 실패',
                text2: '다시 시도해주세요.',
                position: 'bottom'
            });
        }
    };

    // 컴포넌트 마운트 시 수입원 목록 조회
    useEffect(() => {
        fetchIncomeSources();
    }, []);

    const handleLogout = async () => {
        try {
            await dispatch(logoutAsync()).unwrap();
        } catch (error) {
            console.error('로그아웃 실패:', error);
            Toast.show({
                type: 'error',
                text1: '로그아웃 실패',
                text2: '다시 시도해주세요.',
                position: 'bottom'
            });
        }
    };

    const handleUpdateIncome = async () => {
        try {
            const response = await apiClient.put('/api/users/income', {
                income: Number(income),
            });

            if (response.data) {
                const updatedUser: User = {
                    id: user?.id || '',
                    email: user?.email || '',
                    name: user?.name || '',
                    income: Number(income),
                };

                dispatch(setCredentials({
                    user: updatedUser,
                    token: token || ''
                }));
                Toast.show({
                    type: 'success',
                    text1: '수입이 업데이트되었습니다.',
                    position: 'bottom'
                });
                setIsIncomeModalVisible(false);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: '수입 업데이트 실패',
                text2: '다시 시도해주세요.',
                position: 'bottom'
            });
        }
    };

    const handleAddIncomeSource = async (data: {
        name: string;
        amount: number;
        frequency: string;
        nextPaymentDate: Date;
    }) => {
        try {
            await apiClient.post('/api/income/sources', data);
            await fetchIncomeSources();
            const totalIncome = await incomeApi.updateTotalIncome();
            dispatch(setMonthlyIncome(totalIncome.monthlyIncome));
            setIsIncomeModalVisible(false);
            setIsSourceModalVisible(true);
            Toast.show({
                type: 'success',
                text1: '수입원이 추가되었습니다.',
                position: 'bottom'
            });
        } catch (error) {
            console.error('수입원 추가 실패:', error);
            Toast.show({
                type: 'error',
                text1: '수입원 추가 실패',
                text2: '다시 시도해주세요.',
                position: 'bottom'
            });
        }
    };

    const handleDeleteIncomeSource = async (id: string) => {
        try {
            await apiClient.delete(`/api/income/sources/${id}`);
            await fetchIncomeSources();
            const totalIncome = await incomeApi.updateTotalIncome();
            dispatch(setMonthlyIncome(totalIncome.monthlyIncome));
            Toast.show({
                type: 'success',
                text1: '수입원이 삭제되었습니다.',
                position: 'bottom'
            });
        } catch (error) {
            console.error('수입원 삭제 실패:', error);
            Toast.show({
                type: 'error',
                text1: '수입원 삭제 실패',
                text2: '다시 시도해주세요.',
                position: 'bottom'
            });
        }
    };

    const renderMenuItem = (
        icon: string,
        title: string,
        value?: string,
        onPress?: () => void,
        showArrow: boolean = true
    ) => (
        <TouchableOpacity
            style={[
                styles.menuItem,
                isDark && styles.menuItemDark
            ]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={styles.menuItemLeft}>
                <View style={[
                    styles.iconContainer,
                    { backgroundColor: theme.colors.primary + '20' }
                ]}>
                    <IconComponent name={icon} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.menuItemContent}>
                    <Text style={[
                        styles.menuItemTitle,
                        isDark && styles.textDark
                    ]}>
                        {title}
                    </Text>
                    {value && (
                        <Text style={[
                            styles.menuItemValue,
                            isDark && styles.textDark
                        ]}>
                            {value}
                        </Text>
                    )}
                </View>
            </View>
            {showArrow && (
                <IconComponent
                    name="chevron-forward-outline"
                    size={20}
                    color={isDark ? theme.colors.text.inverse : theme.colors.text.secondary}
                />
            )}
        </TouchableOpacity>
    );

    return (
        <ScrollView
            style={[
                styles.container,
                isDark && styles.containerDark
            ]}
        >
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <IconComponent
                        name="person-circle"
                        size={80}
                        color={theme.colors.primary}
                    />
                </View>
                <Text style={[
                    styles.name,
                    isDark && styles.textDark
                ]}>
                    {user?.name}
                </Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    isDark && styles.textDark
                ]}>
                    수입 관리
                </Text>
                {renderMenuItem(
                    'wallet-outline',
                    '수입원 관리',
                    `${incomeSources.length}개의 수입원`,
                    () => setIsSourceModalVisible(true)
                )}
            </View>

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    isDark && styles.textDark
                ]}>
                    계정
                </Text>
                {renderMenuItem('notifications-outline', '알림 설정')}
                {renderMenuItem('lock-closed-outline', '보안')}
                {renderMenuItem('language-outline', '언어', '한국어')}
            </View>

            <View style={styles.section}>
                <Text style={[
                    styles.sectionTitle,
                    isDark && styles.textDark
                ]}>
                    지원
                </Text>
                {renderMenuItem('help-circle-outline', '도움말')}
                {renderMenuItem('information-circle-outline', '앱 정보', '버전 1.0.0', undefined, false)}
                {renderMenuItem('mail-outline', '문의하기')}
            </View>

            <TouchableOpacity
                style={[
                    styles.logoutButton,
                    isDark && styles.logoutButtonDark
                ]}
                onPress={handleLogout}
            >
                <IconComponent name="log-out-outline" size={24} color={theme.colors.danger} />
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

            {/* 수입원 관리 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isSourceModalVisible}
                onRequestClose={() => setIsSourceModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={[
                        styles.modalView,
                        isDark && styles.modalViewDark,
                        styles.sourceModalView
                    ]}>
                        <View style={styles.modalHeader}>
                            <Text style={[
                                styles.modalTitle,
                                isDark && styles.textDark
                            ]}>
                                수입원 관리
                            </Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setIsSourceModalVisible(false)}
                            >
                                <IconComponent
                                    name="close-outline"
                                    size={24}
                                    color={isDark ? theme.colors.text.inverse : theme.colors.text.primary}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.totalIncomeContainer}>
                            <Text style={[styles.totalIncomeLabel, isDark && styles.textDark]}>
                                총 수입
                            </Text>
                            <Text style={[styles.totalIncomeAmount, isDark && styles.textDark]}>
                                ${monthlyIncome.toLocaleString()}
                            </Text>
                        </View>

                        <IncomeSourceList
                            sources={incomeSources}
                            onDelete={handleDeleteIncomeSource}
                        />

                        <TouchableOpacity
                            style={[
                                styles.addSourceButton,
                                isDark && styles.addSourceButtonDark
                            ]}
                            onPress={() => {
                                setIsSourceModalVisible(false);
                                setTimeout(() => {
                                    setIsSourceModalVisible(false);
                                    setIsIncomeModalVisible(true);
                                }, 100);
                            }}
                        >
                            <IconComponent name="add-outline" size={24} color="white" />
                            <Text style={styles.addSourceButtonText}>수입원 추가</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* 수입원 추가 모달 */}
            <IncomeSourceModal
                visible={isIncomeModalVisible}
                onClose={() => {
                    setIsIncomeModalVisible(false);
                    setIsSourceModalVisible(true);
                }}
                onSubmit={handleAddIncomeSource}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    containerDark: {
        backgroundColor: theme.colors.background.dark,
    },
    header: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    name: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: '600' as const,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    email: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.secondary,
    },
    section: {
        padding: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600' as const,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.card.primary,
        borderRadius: theme.borderRadius.lg,
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
    menuItemDark: {
        backgroundColor: theme.colors.card.dark,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.shadow,
                shadowOpacity: 0.2,
            },
        }),
    },
    menuItemLeft: {
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
        marginRight: theme.spacing.md,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemTitle: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    menuItemValue: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
    },
    textDark: {
        color: theme.colors.text.dark.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.danger + '15',
        borderRadius: theme.borderRadius.lg,
        margin: theme.spacing.md,
    },
    logoutButtonDark: {
        backgroundColor: theme.colors.danger + '25',
    },
    logoutText: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.danger,
        marginLeft: theme.spacing.sm,
        fontWeight: '600' as const,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        backgroundColor: theme.colors.card.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    modalViewDark: {
        backgroundColor: theme.colors.card.dark,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.shadow,
                shadowOpacity: 0.25,
            },
        }),
    },
    modalTitle: {
        fontSize: theme.typography.sizes.lg,
        fontWeight: '600' as const,
        color: theme.colors.text.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: theme.spacing.md,
    },
    button: {
        flex: 1,
        marginHorizontal: theme.spacing.xs,
    },
    sourceModalView: {
        height: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    addButton: {
        padding: 8,
    },
    addSourceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    addSourceButtonDark: {
        backgroundColor: theme.colors.primary,
    },
    addSourceButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    transactionFilters: {
        // Add appropriate styles for the transaction filters component
    },
    totalIncomeContainer: {
        backgroundColor: theme.colors.primary + '15',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    totalIncomeLabel: {
        fontSize: 14,
        color: theme.colors.text.secondary,
        marginBottom: 4,
    },
    totalIncomeAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: theme.colors.card.primary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        width: '80%',
    },
    currencyOption: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    currencyText: {
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    selectedCurrency: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
});

export default ProfileScreen; 