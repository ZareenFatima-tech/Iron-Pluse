const { readDB, writeDB } = require('../services/dbService');

const getGyms = (req, res) => {
    try {
        const db = readDB();
        res.json(db.gyms || []);
    } catch (error) {
        console.error("Error fetching gyms:", error);
        res.status(500).json({ message: "Error fetching gyms" });
    }
};

const createGym = (req, res) => {
    try {
        const db = readDB();
        const newGym = {
            id: Date.now().toString(),
            ...req.body,
            lastUpdated: new Date().toISOString()
        };

        db.gyms = db.gyms || [];
        db.gyms.push(newGym);
        writeDB(db);

        console.log(`[GYM ADDED] ID: ${newGym.id}, Name: ${newGym.name}`);
        req.io.emit('gym_added', newGym); // Real-time sync

        res.status(201).json(newGym);
    } catch (error) {
        console.error("Error creating gym:", error);
        res.status(500).json({ message: "Error creating gym" });
    }
};

const updateGym = (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();
        const index = db.gyms.findIndex(g => g.id === id);

        if (index === -1) {
            return res.status(404).json({ message: "Gym not found" });
        }

        const updatedGym = { ...db.gyms[index], ...req.body, lastUpdated: new Date().toISOString() };
        db.gyms[index] = updatedGym;
        writeDB(db);

        console.log(`[GYM UPDATED] ID: ${id}`);
        req.io.emit('gym_updated', updatedGym); // Real-time sync

        res.json(updatedGym);
    } catch (error) {
        console.error("Error updating gym:", error);
        res.status(500).json({ message: "Error updating gym" });
    }
};

const deleteGym = (req, res) => {
    try {
        const { id } = req.params;
        const db = readDB();
        const initialLength = db.gyms.length;
        db.gyms = db.gyms.filter(g => g.id !== id);

        if (db.gyms.length === initialLength) {
            return res.status(404).json({ message: "Gym not found" });
        }

        writeDB(db);

        console.log(`[GYM DELETED] ID: ${id}`);
        req.io.emit('gym_deleted', id); // Real-time sync

        res.json({ message: "Gym deleted successfully" });
    } catch (error) {
        console.error("Error deleting gym:", error);
        res.status(500).json({ message: "Error deleting gym" });
    }
};

module.exports = {
    getGyms,
    createGym,
    updateGym,
    deleteGym
};
