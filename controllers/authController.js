const { readDB, writeDB } = require('../services/dbService');

const login = (req, res) => {
    const { email, password, role } = req.body;
    const db = readDB();
    const collection = role === 'ADMIN' ? db.admins : db.users;

    // Simple authentication
    const user = collection.find(u => u.email === email && u.password === password);

    if (user) {
        const { password, ...userWithoutPass } = user;
        res.json({ success: true, user: { ...userWithoutPass, role } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
};

const register = (req, res) => {
    const { name, email, phone, password, role } = req.body;
    const db = readDB();

    // Determine collection and default to USER if invalid
    const validRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
    const collection = validRole === 'ADMIN' ? db.admins : db.users;

    if (collection.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const newUser = {
        id: Date.now().toString(),
        name, email, phone, password,
        role: validRole
    };

    collection.push(newUser);
    writeDB(db);

    res.json({ success: true, user: newUser });
};

module.exports = { login, register };
