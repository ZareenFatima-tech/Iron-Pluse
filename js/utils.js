const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : '';

const utils = {
    fetchData: async (endpoint) => {
        try {
            // Removing base url if it's already there to avoid duplicates
            const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}/${endpoint}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            utils.showAlert('Server error. Please Ensure Node.js server is running.', 'danger');
            return null;
        }
    },

    postData: async (endpoint, data) => {
        try {
            const response = await fetch(`${BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('Post error:', error);
            return null;
        }
    },

    updateData: async (endpoint, id, data) => {
        try {
            const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('Update error:', error);
            return null;
        }
    },

    deleteData: async (endpoint, id) => {
        try {
            const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Delete error:', error);
            return false;
        }
    },

    showAlert: (message, type = 'success') => {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;

        const div = document.createElement('div');
        div.className = `alert alert-${type} alert-dismissible fade show animate-fade`;
        div.role = 'alert';
        div.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
        alertContainer.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount);
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    checkAuth: (requiredRole) => {
        const user = utils.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return null;
        }
        if (requiredRole && user.role !== requiredRole) {
            alert("Access Restricted: You need " + requiredRole + " privileges to view this page. Please login with an appropriate account.");
            utils.logout(); // Auto logout to allow login as Admin
            return null;
        }
        return user;
    },

    logout: () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    isGymOpen: (opening, closing) => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const [openH, openM] = opening.split(':').map(Number);
        const [closeH, closeM] = closing.split(':').map(Number);

        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;

        return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    }
};

export default utils;
