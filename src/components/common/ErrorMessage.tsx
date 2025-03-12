import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage = ({ message }: ErrorMessageProps) => (
    <View style={styles.container}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.message}>{message}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
    },
});

export default ErrorMessage; 