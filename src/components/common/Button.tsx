import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import theme from '@styles/theme';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', style, ...props }) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
                style
            ]}
            {...props}
        >
            <Text style={[
                styles.text,
                variant === 'primary' ? styles.primaryText : styles.secondaryText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    text: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '600',
    },
    primaryText: {
        color: theme.colors.text.inverse,
    },
    secondaryText: {
        color: theme.colors.primary,
    },
});
