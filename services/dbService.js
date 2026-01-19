const fs = require('fs');
const path = require('path');
const os = require('os');

// Detect if running on Vercel
const isVercel = process.env.VERCEL === '1';

// Source DB (Read-only on Vercel)
const SOURCE_DB_FILE = path.join(__dirname, '../db.json');

// Target DB (Writable)
// On Vercel, use /tmp which is the only writable path. Locally use db.json.
// Note: /tmp is ephemeral and will be lost on new deployments or cold starts.
const DB_FILE = isVercel ? path.join(os.tmpdir(), 'db.json') : SOURCE_DB_FILE;

const readDB = () => {
    // If on Vercel and /tmp/db.json doesn't exist yet, copy it from source or init empty
    if (isVercel && !fs.existsSync(DB_FILE)) {
        if (fs.existsSync(SOURCE_DB_FILE)) {
            const content = fs.readFileSync(SOURCE_DB_FILE, 'utf8');
            fs.writeFileSync(DB_FILE, content);
        } else {
            const initialData = { users: [], admins: [], gyms: [], bookings: [], payments: [] };
            fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
        }
    }

    if (!fs.existsSync(DB_FILE)) {
        // Initialize with default structure if missing (Locally)
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
