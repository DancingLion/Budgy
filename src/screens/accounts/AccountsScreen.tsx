import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import PlaidLinkComponent from '@components/plaid/PlaidLink';

const AccountsScreen = () => {
    const accounts = useSelector((state: RootState) => state.accounts.accounts);

    const renderAccount = ({ item }: any) => (
        <TouchableOpacity style={styles.accountCard}>
            <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={styles.accountType}>{item.type}</Text>
            </View>
            <View style={styles.balanceInfo}>
                <Text style={styles.balanceAmount}>
                    ₩{item.balance.toLocaleString()}
                </Text>
                {item.availableBalance && (
                    <Text style={styles.availableBalance}>
                        사용 가능: ₩{item.availableBalance.toLocaleString()}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <PlaidLinkComponent />
            <FlatList
                data={accounts}
                renderItem={renderAccount}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContainer: {
        padding: 16,
    },
    accountCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    accountInfo: {
        marginBottom: 8,
    },
    accountName: {
        fontSize: 18,
        fontWeight: '600',
    },
    accountType: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    balanceInfo: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
        marginTop: 8,
    },
    balanceAmount: {
        fontSize: 20,
        fontWeight: '700',
    },
    availableBalance: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
});

export default AccountsScreen; 