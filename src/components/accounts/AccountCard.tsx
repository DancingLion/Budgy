import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface AccountCardProps {
    account: {
        id: string;
        name: string;
        type: string;
        balance: number;
    };
}

const IconComponent = Icon as any;

const AccountCard = ({ account }: AccountCardProps) => {
    return (
        <TouchableOpacity style={styles.card}>
            <View style={styles.leftContent}>
                <IconComponent
                    name={account.type === '저축' ? 'savings-outline' : 'wallet-outline'}
                    size={24}
                    color="#007AFF"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>{account.type}</Text>
                </View>
            </View>
            <Text style={styles.balance}>
                {new Intl.NumberFormat('ko-KR', {
                    style: 'currency',
                    currency: 'KRW'
                }).format(account.balance)}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        marginLeft: 12,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    accountType: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    balance: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
});

export default AccountCard; 