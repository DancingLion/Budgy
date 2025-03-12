import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    Platform,
    Pressable,
} from 'react-native';
import { Input, Button } from '../common';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import theme from '../../styles/theme';
import { IncomeFrequency } from '@prisma/client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { setMonthlyIncome } from '../../store/slices/dashboardSlice';
import { incomeApi } from '../../api/income';
import { useSelector as useReduxSelector } from 'react-redux';
import { RootState } from '../../store/';

interface IncomeSourceModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        amount: number;
        frequency: IncomeFrequency;
        nextPaymentDate: Date;
    }) => void;
}

interface FrequencyPickerProps {
    frequency: IncomeFrequency;
    setFrequency: (frequency: IncomeFrequency) => void;
    isDark: boolean;
}

const FrequencyPicker: React.FC<FrequencyPickerProps> = ({ frequency, setFrequency, isDark }) => {
    const pickerItems = [
        { label: '매주', value: 'WEEKLY' },
        { label: '2주마다', value: 'BIWEEKLY' },
        { label: '매월', value: 'MONTHLY' },
        { label: '매년', value: 'ANNUAL' },
        { label: '1회성', value: 'ONE_TIME' },
    ];

    return Platform.OS === 'ios' ? (
        <Picker
            selectedValue={frequency}
            onValueChange={(value) => setFrequency(value as IncomeFrequency)}
            style={[styles.picker, isDark && styles.pickerDark]}
        >
            {pickerItems.map((item) => (
                <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    color={isDark ? theme.colors.text.inverse : theme.colors.text.primary}
                />
            ))}
        </Picker>
    ) : (
        <Picker
            selectedValue={frequency}
            onValueChange={(value) => setFrequency(value as IncomeFrequency)}
            style={[styles.picker, isDark && styles.pickerDark]}
            dropdownIconColor={isDark ? theme.colors.text.inverse : theme.colors.text.primary}
        >
            {pickerItems.map((item) => (
                <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    style={[
                        styles.androidPickerItem,
                        isDark && styles.androidPickerItemDark
                    ]}
                />
            ))}
        </Picker>
    );
};

const IncomeSourceModal: React.FC<IncomeSourceModalProps> = ({
    visible,
    onClose,
    onSubmit,
}) => {
    const dispatch = useDispatch();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { user } = useSelector((state: RootState) => state.auth);

    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [frequency, setFrequency] = useState<IncomeFrequency>('MONTHLY');
    const [nextPaymentDate, setNextPaymentDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (selectedDate) {
                setNextPaymentDate(selectedDate);
            }
        } else {
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleDateConfirm = () => {
        setNextPaymentDate(tempDate);
        setShowDatePicker(false);
    };

    const handleDateCancel = () => {
        setTempDate(nextPaymentDate);
        setShowDatePicker(false);
    };

    const handleSubmit = async () => {
        if (!name || !amount) return;

        try {
            // 수입원 추가
            await onSubmit({
                name,
                amount: Number(amount),
                frequency,
                nextPaymentDate,
            });

            // 총 수입 업데이트
            const totalIncome = await incomeApi.updateTotalIncome();
            dispatch(setMonthlyIncome(totalIncome.monthlyIncome));

            // Reset form and close modal
            setName('');
            setAmount('');
            setFrequency('MONTHLY');
            setNextPaymentDate(new Date());
            onClose();
        } catch (error) {
            console.error('Error submitting income source:', error);
        }
    };

    const formatCurrency = (amount: number) => {
        return `$${amount.toLocaleString()}`;
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[
                    styles.modalView,
                    isDark && styles.modalViewDark
                ]}>
                    <Text style={[
                        styles.modalTitle,
                        isDark && styles.textDark
                    ]}>
                        수입원 추가
                    </Text>

                    <ScrollView style={styles.form}>
                        <Input
                            label="수입원 이름"
                            value={name}
                            onChangeText={setName}
                            placeholder="예: 월급, 부수입 등"
                            style={[
                                styles.input,
                                isDark && styles.inputDark
                            ]}
                            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : undefined}
                        />

                        <Input
                            label="금액"
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            style={[
                                styles.input,
                                isDark && styles.inputDark
                            ]}
                            placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.5)' : undefined}
                        />

                        <Text style={[
                            styles.label,
                            isDark && styles.textDark
                        ]}>
                            수입 주기
                        </Text>
                        <View style={[
                            styles.pickerContainer,
                            isDark && styles.pickerContainerDark
                        ]}>
                            <FrequencyPicker
                                frequency={frequency}
                                setFrequency={setFrequency}
                                isDark={isDark}
                            />
                        </View>

                        <Text style={[
                            styles.label,
                            isDark && styles.textDark
                        ]}>
                            다음 지급일
                        </Text>
                        <TouchableOpacity
                            style={[
                                styles.dateButton,
                                isDark && styles.dateButtonDark
                            ]}
                            onPress={() => {
                                setTempDate(nextPaymentDate);
                                setShowDatePicker(true);
                            }}
                        >
                            <Text style={[
                                styles.dateButtonText,
                                isDark && styles.textDark
                            ]}>
                                {format(nextPaymentDate, 'PPP', { locale: ko })}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {showDatePicker && Platform.OS === 'ios' && (
                        <Modal
                            transparent={true}
                            visible={showDatePicker}
                            animationType="slide"
                        >
                            <View style={styles.datePickerModalContainer}>
                                <View style={[
                                    styles.datePickerContent,
                                    isDark && {
                                        backgroundColor: theme.colors.background.dark,
                                    }
                                ]}>
                                    <DateTimePicker
                                        value={tempDate}
                                        mode="date"
                                        display="spinner"
                                        onChange={handleDateChange}
                                        locale="ko"
                                        textColor={isDark ? theme.colors.text.inverse : theme.colors.text.primary}
                                        themeVariant={isDark ? 'dark' : 'light'}
                                        style={styles.datePicker}
                                    />
                                    <View style={[
                                        styles.datePickerButtonContainer,
                                        isDark && {
                                            backgroundColor: theme.colors.background.dark,
                                            borderTopColor: theme.colors.border.dark
                                        }
                                    ]}>
                                        <Pressable
                                            style={styles.datePickerButton}
                                            onPress={handleDateCancel}
                                        >
                                            <Text style={styles.datePickerButtonText}>
                                                취소
                                            </Text>
                                        </Pressable>
                                        <View style={[
                                            styles.buttonSeparator,
                                            isDark && {
                                                backgroundColor: theme.colors.border.dark
                                            }
                                        ]} />
                                        <Pressable
                                            style={styles.datePickerButton}
                                            onPress={handleDateConfirm}
                                        >
                                            <Text style={[
                                                styles.datePickerButtonText,
                                                styles.confirmButton
                                            ]}>
                                                확인
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {showDatePicker && Platform.OS === 'android' && (
                        <DateTimePicker
                            value={nextPaymentDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                        />
                    )}

                    <View style={styles.buttonContainer}>
                        <Button
                            title="취소"
                            onPress={onClose}
                            variant="secondary"
                            style={styles.button}
                        />
                        <Button
                            title="추가"
                            onPress={handleSubmit}
                            style={styles.button}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '85%',
        maxHeight: '75%',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
    },
    modalViewDark: {
        backgroundColor: theme.colors.background.dark,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    textDark: {
        color: theme.colors.text.inverse,
    },
    form: {
        marginBottom: 16,
    },
    label: {
        fontSize: 15,
        marginBottom: 8,
        color: theme.colors.text.primary,
        fontWeight: '500',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: 'white',
        overflow: 'hidden',
        height: Platform.OS === 'android' ? 50 : 120,
    },
    pickerContainerDark: {
        backgroundColor: theme.colors.background.dark,
        borderColor: theme.colors.border.dark,
    },
    picker: {
        width: '100%',
        ...Platform.select({
            ios: {
                height: 150,
            },
            android: {
                height: 50,
            },
        }),
    },
    pickerDark: {
        color: theme.colors.text.inverse,
    },
    androidPickerItem: {
        fontSize: 16,
        color: theme.colors.text.primary,
        backgroundColor: 'transparent',
    },
    androidPickerItemDark: {
        color: theme.colors.text.inverse,
    },
    dateButton: {
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: 12,
        padding: 14,
        marginBottom: 20,
        backgroundColor: 'white',
    },
    dateButtonDark: {
        backgroundColor: theme.colors.background.dark,
        borderColor: theme.colors.border.dark,
    },
    dateButtonText: {
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    button: {
        flex: 1,
        marginHorizontal: 6,
    },
    datePickerModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    datePickerContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
    },
    datePicker: {
        height: 200,
    },
    datePickerButtonContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        backgroundColor: 'white',
    },
    datePickerButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonSeparator: {
        width: 1,
        backgroundColor: theme.colors.border.light,
    },
    datePickerButtonText: {
        fontSize: 16,
        color: theme.colors.primary,
    },
    confirmButton: {
        fontWeight: '600',
    },
    input: {
        backgroundColor: 'white',
        color: theme.colors.text.primary,
        borderRadius: 12,
        marginBottom: 20,
    },
    inputDark: {
        backgroundColor: theme.colors.background.dark,
        color: theme.colors.text.inverse,
    },
});

export default IncomeSourceModal; 