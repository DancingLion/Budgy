import React from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle
} from 'react-native';
import theme from '../../styles/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    containerStyle,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error && styles.inputError,
                    style,
                ]}
                placeholderTextColor={theme.colors.text.secondary}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.md,
    },
    label: {
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text.secondary,
        marginBottom: theme.spacing.xs,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        fontSize: theme.typography.sizes.md,
        backgroundColor: theme.colors.background.secondary,
        color: theme.colors.text.primary,
    },
    inputError: {
        borderWidth: 1,
        borderColor: theme.colors.danger,
    },
    error: {
        color: theme.colors.danger,
        fontSize: theme.typography.sizes.sm,
        marginTop: theme.spacing.xs,
    },
});
