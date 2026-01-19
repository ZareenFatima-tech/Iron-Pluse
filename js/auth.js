import utils from './utils.js';

const auth = {
    login: async (email, password, role) => {
        const endpoint = role === 'ADMIN' ? 'admins' : 'users';
        const data = await utils.fetchData(`${endpoint}?email=${email}&password=${password}`);

        if (data && data.length > 0) {
            const user = data[0];
            localStorage.setItem('currentUser', JSON.stringify({ ...user, role }));
            utils.showAlert('Welcome back! Logging you in...', 'success');

            setTimeout(() => {
                window.location.href = role === 'ADMIN' ? 'admin-dashboard.html' : 'dashboard.html';
            }, 1000);
            return true;
        } else {
            utils.showAlert('Invalid credentials. Please try again.', 'danger');
            return false;
        }
    },

    register: async (userData) => {
        const response = await utils.postData('register', userData);
        if (response && response.success) {
            utils.showAlert('Account created successfully! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return true;
        } else {
            utils.showAlert(response ? response.message : 'Registration failed.', 'danger');
            return false;
        }
    }
};

export default auth;
