import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Platform,
    useColorScheme,
    Animated,
    LayoutAnimation,
    UIManager,
    Text
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import theme from '../../styles/theme';
import TransactionSync from './TransactionSync';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const IconComponent = Icon as any;

export const convertPlaidToAppCategory = (plaidCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
        'FOOD_AND_DRINK': '식비',
        'FOOD AND DRINK': '식비',
        'TRAVEL': '교통',
        'TRANSPORTATION': '교통',
        'TRANSFER': '기타',
        'PAYMENT': '기타',
        'SHOPPING': '쇼핑',
        'ENTERTAINMENT': '오락',
        'UTILITIES': '공과금',
        'MEDICAL': '의료',
        'HEALTHCARE': '의료',
        'EDUCATION': '교육'
    };

    // 대소문자 구분 없이 매핑
    const normalizedCategory = plaidCategory.toUpperCase();
    return categoryMap[normalizedCategory] || categoryMap[plaidCategory] || '기타';
};

const convertAppToPlaidCategory = (appCategory: string): string => {
    const categoryMap: { [key: string]: string } = {
        '식비': 'Food and Drink',
        '교통': 'Travel',
        '쇼핑': 'Shopping',
        '오락': 'Entertainment',
        '공과금': 'Utilities',
        '의료': 'Medical',
        '교육': 'Education',
        '기타': 'Payment'
    };
    return categoryMap[appCategory] || appCategory;
};

interface TransactionFiltersProps {
    onSearch: (filters: {
        startDate: Date | null;
        endDate: Date | null;
        category: string | null;
    }) => void;
    initialFilters?: {
        startDate: Date | null;
        endDate: Date | null;
        category: string | null;
    };
}

const CATEGORIES = [
    '전체',
    '식비',
    '쇼핑',
    '교통',
    '오락',
    '공과금',
    '의료',
    '교육',
    '기타'
];

const expandedHeight = 300; // 필터 섹션이 펼쳐졌을 때의 높이

interface DatePickerProps {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ onSearch, initialFilters }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [showStartDate, setShowStartDate] = useState(false);
    const [showEndDate, setShowEndDate] = useState(false);
    const [startDate, setStartDate] = useState<Date | null>(initialFilters?.startDate || null);
    const [endDate, setEndDate] = useState<Date | null>(initialFilters?.endDate || null);
    const [category, setCategory] = useState<string>(initialFilters?.category || '전체');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const heightAnim = useRef(new Animated.Value(1)).current;
    const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

    // Enable LayoutAnimation for Android
    if (Platform.OS === 'android') {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        Animated.parallel([
            Animated.timing(rotateAnim, {
                toValue: isExpanded ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(heightAnim, {
                toValue: isExpanded ? 0 : 1,
                duration: 250,
                useNativeDriver: false,
            })
        ]).start();
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const containerHeight = heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 200]
    });

    const containerOpacity = heightAnim.interpolate({
        inputRange: [0, 0.1, 1],
        outputRange: [0, 0, 1]
    });

    useEffect(() => {
        if (initialFilters) {
            setStartDate(initialFilters.startDate);
            setEndDate(initialFilters.endDate);
            setCategory(initialFilters.category || '전체');
        }
    }, [initialFilters]);

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'set') {
            setShowStartDate(false);
            if (selectedDate) {
                setStartDate(selectedDate);
            }
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        if (event.type === 'set') {
            setShowEndDate(false);
            if (selectedDate) {
                setEndDate(selectedDate);
            }
        }
    };

    const handleCategoryChange = (itemValue: string) => {
        setCategory(itemValue);
        if (Platform.OS === 'android') {
            setShowCategoryPicker(false);
        }
    };

    const handleSearch = () => {
        const searchParams: any = {
            startDate,
            endDate,
        };

        if (category !== '전체') {
            searchParams.category = convertAppToPlaidCategory(category);
        }

        console.log('Sending search params:', searchParams);
        onSearch(searchParams);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '선택';
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(date);
    };

    const handleStartDateConfirm = (date: Date) => {
        setStartDatePickerVisible(false);
        setStartDate(date);
        setShowStartDate(false);
    };

    const handleEndDateConfirm = (date: Date) => {
        setEndDatePickerVisible(false);
        setEndDate(date);
        setShowEndDate(false);
    };

    return (
        <>
            <View style={[
                styles.headerContainer,
                isDark && {
                    backgroundColor: theme.colors.card.dark,
                    borderBottomColor: theme.colors.border.dark
                }
            ]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            isDark && { backgroundColor: theme.colors.background.dark }
                        ]}
                        onPress={toggleExpand}
                    >
                        <IconComponent
                            name="options-outline"
                            size={22}
                            color={isDark ? theme.colors.text.dark.primary : theme.colors.text.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.iconButton,
                            isDark && { backgroundColor: theme.colors.background.dark }
                        ]}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleSearch();
                        }}
                    >
                        <IconComponent
                            name="sync-outline"
                            size={22}
                            color={theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[
                            styles.searchButton,
                            isDark && { backgroundColor: theme.colors.primary }
                        ]}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleSearch();
                        }}
                    >
                        <IconComponent
                            name="search"
                            size={22}
                            color={theme.colors.text.inverse}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <Animated.View style={[
                styles.filtersContainer,
                {
                    maxHeight: containerHeight,
                    opacity: containerOpacity,
                },
                isDark && { backgroundColor: theme.colors.card.dark }
            ]}>
                <View style={styles.dateFilters}>
                    <TouchableOpacity
                        style={[
                            styles.dateButton,
                            isDark && { backgroundColor: theme.colors.background.dark }
                        ]}
                        onPress={() => setStartDatePickerVisible(true)}
                    >
                        <IconComponent name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={[
                            styles.dateValue,
                            isDark && { color: theme.colors.text.dark.primary }
                        ]}>
                            {startDate ? format(startDate, 'yyyy.MM.dd', { locale: ko }) : '시작일'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={[
                        styles.dateSeparator,
                        isDark && { color: theme.colors.text.dark.secondary }
                    ]}>~</Text>

                    <TouchableOpacity
                        style={[
                            styles.dateButton,
                            isDark && { backgroundColor: theme.colors.background.dark }
                        ]}
                        onPress={() => setEndDatePickerVisible(true)}
                    >
                        <IconComponent name="calendar" size={20} color={theme.colors.primary} />
                        <Text style={[
                            styles.dateValue,
                            isDark && { color: theme.colors.text.dark.primary }
                        ]}>
                            {endDate ? format(endDate, 'yyyy.MM.dd', { locale: ko }) : '종료일'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.categoryButton,
                        isDark && {
                            backgroundColor: theme.colors.background.dark,
                            borderColor: theme.colors.border.dark
                        }
                    ]}
                    onPress={() => setShowCategoryPicker(true)}
                >
                    <IconComponent name="pricetag-outline" size={18} color={theme.colors.primary} />
                    <View style={styles.categoryTextContainer}>
                        <Text style={[
                            styles.categoryLabel,
                            isDark && { color: theme.colors.text.dark.secondary }
                        ]}>카테고리</Text>
                        <Text style={[
                            styles.categoryValue,
                            isDark && { color: theme.colors.text.dark.primary }
                        ]}>{category}</Text>
                    </View>
                    <IconComponent
                        name="chevron-down-outline"
                        size={18}
                        color={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                    />
                </TouchableOpacity>
            </Animated.View>

            <DateTimePickerModal
                isVisible={isStartDatePickerVisible}
                mode="date"
                onConfirm={handleStartDateConfirm}
                onCancel={() => setStartDatePickerVisible(false)}
                date={startDate || new Date()}
                locale="ko"
                buttonTextColorIOS={isDark ? theme.colors.text.dark.primary : theme.colors.text.primary}
                themeVariant={isDark ? 'dark' : 'light'}
            />

            <DateTimePickerModal
                isVisible={isEndDatePickerVisible}
                mode="date"
                onConfirm={handleEndDateConfirm}
                onCancel={() => setEndDatePickerVisible(false)}
                date={endDate || new Date()}
                locale="ko"
                buttonTextColorIOS={isDark ? theme.colors.text.dark.primary : theme.colors.text.primary}
                themeVariant={isDark ? 'dark' : 'light'}
            />

            {showCategoryPicker && Platform.OS === 'ios' && (
                <View style={[
                    styles.pickerContainer,
                    isDark && {
                        backgroundColor: theme.colors.background.dark,
                        borderTopColor: theme.colors.border.dark
                    }
                ]}>
                    <View style={[
                        styles.pickerHeader,
                        isDark && {
                            borderBottomColor: theme.colors.border.dark,
                            backgroundColor: theme.colors.background.dark
                        }
                    ]}>
                        <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                            <Text style={[
                                styles.pickerCancelButton,
                                { color: theme.colors.danger }
                            ]}>취소</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                            <Text style={[
                                styles.pickerDoneButton,
                                { color: theme.colors.primary }
                            ]}>완료</Text>
                        </TouchableOpacity>
                    </View>
                    <Picker
                        selectedValue={category}
                        onValueChange={handleCategoryChange}
                        style={[
                            styles.picker,
                            isDark && { backgroundColor: theme.colors.background.dark }
                        ]}
                    >
                        {CATEGORIES.map((cat) => (
                            <Picker.Item
                                key={cat}
                                label={cat}
                                value={cat}
                                color={isDark ? theme.colors.text.dark.primary : theme.colors.text.primary}
                            />
                        ))}
                    </Picker>
                </View>
            )}

            {Platform.OS === 'android' && showCategoryPicker && (
                <Picker
                    selectedValue={category}
                    onValueChange={handleCategoryChange}
                    style={[
                        styles.androidPicker,
                        isDark && { backgroundColor: theme.colors.background.dark }
                    ]}
                    dropdownIconColor={isDark ? '#FFFFFF' : '#000000'}
                >
                    {CATEGORIES.map((cat) => (
                        <Picker.Item
                            key={cat}
                            label={cat}
                            value={cat}
                            color={isDark ? '#FFFFFF' : '#000000'}
                        />
                    ))}
                </Picker>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.card.primary,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.background.secondary,
    },
    searchButton: {
        padding: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
    },
    filtersContainer: {
        backgroundColor: theme.colors.card.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
    },
    dateFilters: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.sm
    },
    dateValue: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.primary,
        flex: 1,
    },
    dateSeparator: {
        marginHorizontal: theme.spacing.sm,
        color: theme.colors.text.secondary,
        fontSize: theme.typography.sizes.md,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    categoryTextContainer: {
        flex: 1,
        marginLeft: theme.spacing.sm,
    },
    categoryLabel: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    categoryValue: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text.primary,
        fontWeight: '500' as const,
    },
    pickerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
        zIndex: 1000,
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.primary,
    },
    pickerCancelButton: {
        fontSize: 16,
    },
    pickerDoneButton: {
        fontSize: 16,
        fontWeight: '600',
    },
    picker: {
        height: 216,
    },
    androidPicker: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border.light,
        marginVertical: theme.spacing.md,
    },
});

export default TransactionFilters; 