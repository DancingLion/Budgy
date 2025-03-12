import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { login } from '@store/slices/authSlice';
import { apiClient } from '@api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch } from '@store/index';
import theme from '@styles/theme';

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const isDark = useColorScheme() === 'dark';

    const handleLogin = async () => {
        try {
            setLoading(true);
            await dispatch(login({ email, password })).unwrap();
            // 성공하면 자동으로 isAuthenticated가 true로 설정됨
        } catch (error: any) {
            Alert.alert(
                '로그인 실패',
                error.message || '로그인에 실패했습니다.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[
                styles.container,
                isDark && { backgroundColor: theme.colors.background.dark }
            ]}
        >
            <View style={[
                styles.formContainer,
                isDark && { backgroundColor: theme.colors.card.dark }
            ]}>
                <Text style={[
                    styles.title,
                    isDark && { color: theme.colors.text.dark.primary }
                ]}>로그인</Text>

                <TextInput
                    style={[
                        styles.input,
                        isDark && {
                            backgroundColor: theme.colors.card.dark,
                            color: theme.colors.text.dark.primary,
                            borderColor: theme.colors.border.dark,
                        }
                    ]}
                    placeholder="이메일을 입력하세요"
                    placeholderTextColor={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={[
                        styles.input,
                        isDark && {
                            backgroundColor: theme.colors.card.dark,
                            color: theme.colors.text.dark.primary,
                            borderColor: theme.colors.border.dark,
                        }
                    ]}
                    placeholder="비밀번호를 입력하세요"
                    placeholderTextColor={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <TouchableOpacity
                    style={[
                        styles.button,
                        loading && styles.buttonDisabled,
                        isDark && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={[
                        styles.buttonText,
                        isDark && { color: theme.colors.text.inverse }
                    ]}>
                        {loading ? '로그인 중...' : '로그인'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={() => navigation.navigate('Register')}
                >
                    <Text style={styles.registerText}>
                        계정이 없으신가요? 회원가입
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    formContainer: {
        width: '80%',
        maxWidth: 400,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.card.primary,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: theme.typography.sizes.xl,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: theme.colors.text.inverse,
        fontSize: theme.typography.sizes.md,
        fontWeight: '600',
    },
    registerButton: {
        marginTop: theme.spacing.md,
        alignItems: 'center',
    },
    registerText: {
        color: '#007AFF',
        fontSize: theme.typography.sizes.md,
    },
});

export default LoginScreen;
