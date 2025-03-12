import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    useColorScheme,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { register } from '@store/slices/authSlice';
import { AppDispatch } from '@store/index';
import theme from '../../styles/theme';
import { Input, Button } from '../../components/common';

const RegisterScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const isDark = useColorScheme() === 'dark';

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 8) {
            Alert.alert('오류', '비밀번호는 8자리 이상이어야 합니다.');
            return;
        }

        try {
            setLoading(true);
            await dispatch(register({ email, password, name })).unwrap();
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert(
                '회원가입 실패',
                error instanceof Error ? error.message : '회원가입에 실패했습니다.'
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
                ]}>회원가입</Text>

                <Input
                    label="이름"
                    placeholder="이름을 입력하세요"
                    value={name}
                    onChangeText={setName}
                    style={[
                        isDark && {
                            backgroundColor: theme.colors.card.dark,
                            color: theme.colors.text.dark.primary,
                            borderColor: theme.colors.border.dark,
                        }
                    ]}
                    placeholderTextColor={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                />

                <Input
                    label="이메일"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[
                        isDark && {
                            backgroundColor: theme.colors.card.dark,
                            color: theme.colors.text.dark.primary,
                            borderColor: theme.colors.border.dark,
                        }
                    ]}
                    placeholderTextColor={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                />

                <Input
                    label="비밀번호"
                    placeholder="비밀번호를 입력하세요 (8자리 이상)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[
                        isDark && {
                            backgroundColor: theme.colors.card.dark,
                            color: theme.colors.text.dark.primary,
                            borderColor: theme.colors.border.dark,
                        }
                    ]}
                    placeholderTextColor={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                />

                <Input
                    label="비밀번호 확인"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={[
                        isDark && {
                            backgroundColor: theme.colors.card.dark,
                            color: theme.colors.text.dark.primary,
                            borderColor: theme.colors.border.dark,
                        }
                    ]}
                    placeholderTextColor={isDark ? theme.colors.text.dark.secondary : theme.colors.text.secondary}
                />

                <Button
                    title={loading ? "가입 중..." : "회원가입"}
                    onPress={handleRegister}
                    disabled={loading}
                    variant="primary"
                />

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={[
                        styles.loginText,
                        isDark && { color: theme.colors.primary }
                    ]}>
                        이미 계정이 있으신가요? 로그인
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
    loginButton: {
        marginTop: theme.spacing.md,
        alignItems: 'center',
    },
    loginText: {
        color: theme.colors.primary,
        fontSize: theme.typography.sizes.md,
    },
});

export default RegisterScreen; 