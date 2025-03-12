export const PLAID_ENDPOINTS = {
    createLinkToken: '/link/token/create',
    exchangePublicToken: '/item/public_token/exchange',
    getAccounts: '/accounts/get',
    getTransactions: '/transactions/get',
    syncTransactions: '/transactions/sync'
};

export const API_ENDPOINTS = {
    auth: {
        register: '/api/auth/register',
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        me: '/api/auth/me'
    },
    plaid: {
        createLinkToken: '/api/plaid/create-link-token',
        exchangeToken: '/api/plaid/exchange-token',
        getAccounts: '/api/plaid/get-accounts',
        getAccessToken: '/api/plaid/access-token'
    },
    accounts: {
        create: '/api/accounts',
        getAll: '/api/accounts',
        getOne: (id: string) => `/api/accounts/${id}`,
        update: (id: string) => `/api/accounts/${id}`,
        delete: (id: string) => `/api/accounts/${id}`,
        updateBalances: '/api/accounts/update-balances'
    },
    transactions: {
        list: '/api/transactions',
        create: '/api/transactions',
        update: (id: string) => `/api/transactions/${id}`,
        delete: (id: string) => `/api/transactions/${id}`,
        sync: '/api/transactions/sync'
    },
};
