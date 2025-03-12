import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dotenv from 'dotenv';
import path from 'path';

// 프로젝트 루트의 .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENV = 'sandbox' } = process.env;

// 디버깅을 위한 로그 추가
console.log('Plaid Configuration:', {
    clientId: PLAID_CLIENT_ID,
    secret: PLAID_SECRET?.substring(0, 4) + '****', // 보안을 위해 일부만 표시
    environment: PLAID_ENV,
    basePath: PlaidEnvironments[PLAID_ENV.toLowerCase()]
});

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('PLAID_CLIENT_ID and PLAID_SECRET must be defined');
}

const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV.toLowerCase()],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
        },
    },
});

export const plaidClient = new PlaidApi(configuration);