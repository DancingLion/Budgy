import * as React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { create, open, LinkTokenConfiguration, LinkOpenProps, LinkSuccess, LinkExit } from 'react-native-plaid-link-sdk';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@store/index';
import { createLinkToken, linkBankAccount } from '@store/slices/accountSlice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Accounts: undefined;
    // 다른 화면들도 필요하다면 여기에 추가
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PlaidLink: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation<NavigationProp>();

    const handlePlaidLink = async () => {
        try {
            console.log('Creating link token...');
            const linkToken = await dispatch(createLinkToken()).unwrap();
            console.log('Link token created:', linkToken);

            const tokenConfig: LinkTokenConfiguration = {
                token: linkToken,
                noLoadingState: false
            };

            await create(tokenConfig);

            const openProps: LinkOpenProps = {
                onSuccess: async (success: LinkSuccess) => {
                    console.log('Plaid Link Success:', success);
                    try {
                        if (success.publicToken) {
                            await dispatch(linkBankAccount(success.publicToken)).unwrap();
                            navigation.navigate('Accounts');
                        } else {
                            console.error('No public token received');
                        }
                    } catch (error) {
                        console.error('Failed to link account:', error);
                    }
                },
                onExit: (exit: LinkExit) => {
                    console.log('Plaid Link Exit:', exit);
                }
            };

            await open(openProps);
        } catch (error) {
            console.error('Error in Plaid Link:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title="계좌 연동하기"
                onPress={handlePlaidLink}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});

export default PlaidLink;