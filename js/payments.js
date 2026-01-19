import utils from './utils.js';

const payments = {
    getHistory: async (userId) => {
        return await utils.fetchData(`payments?userId=${userId}&_sort=date&_order=desc`);
    },

    processPayment: async (paymentData) => {
        const res = await utils.postData('payments', {
            ...paymentData,
            id: `PAY-${Date.now()}`,
            status: 'Success',
            date: new Date().toISOString()
        });

        if (res) {
            utils.showAlert('Payment processed successfully! Your receipt is ready.', 'success');
        }
        return res;
    }
};

export default payments;
