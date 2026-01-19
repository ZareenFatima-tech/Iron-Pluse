import utils from './utils.js';

const admin = {
    getStats: async () => {
        const gyms = await utils.fetchData('gyms');
        const bookings = await utils.fetchData('bookings');
        const payments = await utils.fetchData('payments');

        const revenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const pending = bookings.filter(b => b.status === 'Pending').length;

        return {
            totalGyms: gyms.length,
            totalBookings: bookings.length,
            pendingBookings: pending,
            totalRevenue: revenue
        };
    },

    updateBookingStatus: async (id, status) => {
        const existing = await utils.fetchData(`bookings/${id}`);
        const res = await utils.updateData('bookings', id, { ...existing, status });
        if (res) utils.showAlert(`Booking marked as ${status}`, 'success');
        return res;
    },

    getAllBookingsDetailed: async () => {
        return await utils.fetchData('bookings?_expand=gym&_expand=user&_sort=timestamp&_order=desc');
    },

    exportToCSV: (data, filename) => {
        if (!data || data.length === 0) return;
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(item => Object.values(item).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

export default admin;
