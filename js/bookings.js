import utils from './utils.js';

const bookings = {
    createBooking: async (bookingData) => {
        // 1. Check double booking for same user same day same slot
        const userBookings = await utils.fetchData(`bookings?userId=${bookingData.userId}&date=${bookingData.date}&slot=${bookingData.slot}`);
        if (userBookings && userBookings.length > 0) {
            utils.showAlert('You already have a booking for this time slot!', 'warning');
            return null;
        }

        // 2. Check gym capacity
        const gymBookings = await utils.fetchData(`bookings?gymId=${bookingData.gymId}&date=${bookingData.date}&slot=${bookingData.slot}`);
        const gym = await utils.fetchData(`gyms/${bookingData.gymId}`);

        if (gymBookings && gymBookings.length >= gym.capacity) {
            utils.showAlert('Sorry, this time slot is fully booked at this gym.', 'danger');
            return null;
        }

        // 3. Create booking
        const newBooking = await utils.postData('bookings', {
            ...bookingData,
            status: 'Pending',
            timestamp: new Date().toISOString()
        });

        if (newBooking) {
            utils.showAlert('Booking request submitted! Waiting for admin confirmation.', 'success');
            // Simulate Notification
            console.log(`[Notification] Booking alert sent to owner of ${gym.name}`);
        }
        return newBooking;
    },

    getUserBookings: async (userId) => {
        return await utils.fetchData(`bookings?userId=${userId}&_expand=gym&_sort=date&_order=desc`);
    },

    cancelBooking: async (bookingId) => {
        const res = await utils.updateData('bookings', bookingId, { status: 'Cancelled' });
        if (res) utils.showAlert('Booking cancelled successfully.', 'info');
        return res;
    }
};

export default bookings;
