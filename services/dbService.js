const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../db.json');

const readDB = () => {
    if (!fs.existsSync(DB_FILE)) {
        // Initialize with default structure if missing
        const initialData = { users: [], admins: [], gyms: [], bookings: [], payments: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};

const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
    readDB,
    writeDB
};
