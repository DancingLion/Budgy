import cron from 'node-cron';
import { apiClient } from '../api/client';

// 매일 자정에 실행
cron.schedule('0 0 * * *', async () => {
    try {
        console.log('Starting automatic income update...');
        await apiClient.post('/income/auto-update');
        console.log('Automatic income update completed successfully.');
    } catch (error) {
        console.error('Error during automatic income update:', error);
    }
}); 