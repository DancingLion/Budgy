import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import theme from '../../styles/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'outlined' | 'elevated';
}

const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
    return (
        <View style={[styles.card, styles[variant], style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.lg,
        margin: theme.spacing.sm,
    },
    default: {
        backgroundColor: theme.colors.background.primary,
    },
    outlined: {
        backgroundColor: theme.colors.background.primary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
    },
    elevated: {
        backgroundColor: theme.colors.background.primary,
        ...theme.shadows.md,
    },
});

export default Card;
