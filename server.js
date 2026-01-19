const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Controllers/Routes
const gymRoutes = require('./routes/gymRoutes');
const { login, register } = require('./controllers/authController');
const { readDB, writeDB } = require('./services/dbService'); // For generic routes

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve frontend

// Attach IO to request for controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- API Routes ---
app.use('/gyms', gymRoutes);
app.post('/login', login);
app.post('/register', register);

// Explicitly serve index.html for root
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.sendFile(path.join(process.cwd(), 'index.html')); // Fallback to cwd
    }
});

// Legacy/Generic Routes (for other resources like bookings/payments if needed)
app.get('/:resource', (req, res, next) => {
    if (req.path.startsWith('/gyms')) return next(); // Skip if handled by specific route
    const { resource } = req.params;
    const db = readDB();
    if (!db[resource]) return res.json([]);
    let data = db[resource];

    // Simple filter
    const query = req.query;
    Object.keys(query).forEach(key => {
        if (key.startsWith('_')) return;
        data = data.filter(item => String(item[key]) === String(query[key]));
    });

    // Expand
    const expands = [].concat(query._expand || []); // handles string or array

    if (expands.includes('gym')) {
        data = data.map(item => ({
            ...item,
            gym: db.gyms ? db.gyms.find(g => g.id === item.gymId) : null
        }));
    }

    if (expands.includes('user')) {
        data = data.map(item => ({
            ...item,
            user: db.users ? db.users.find(u => u.id === item.userId) : null
        }));
    }

    res.json(data);
});

app.get('/:resource/:id', (req, res, next) => {
    // If it is /gyms/123, it might overlap if gymRoutes doesn't handle /:id.
    // Ideally specific routes should be handled first.
    // If gymRoutes does NOT have /:id, this generic one typically won't be reached if used properly with app.use('/gyms').
    // BUT express router matching is tricky. /gyms enters gym router. if gym router has no match, it exits.
    // Then it tries next middleware... which is THIS generic one.
    // HOWEVER, the param matching might be an issue? :resource would be 'gyms', :id would be '123'. 
    // Yes, app.get('/:resource/:id') matches /gyms/123.

    if (req.path.startsWith('/gyms') && false) return next(); // Not skipping for now as gymRoutes likely misses GET /:id

    const { resource, id } = req.params;
    const db = readDB();

    if (!db[resource]) return res.status(404).send('Not Found');

    const item = db[resource].find(i => i.id == id);
    if (item) res.json(item);
    else res.status(404).send('Not Found');
});

app.post('/:resource', (req, res, next) => {
    if (req.path.startsWith('/gyms')) return next();
    const { resource } = req.params;
    const db = readDB();
    if (!db[resource]) db[resource] = [];
    const newItem = { id: Date.now().toString(), ...req.body };
    db[resource].push(newItem);
    writeDB(db);

    // Dynamic Socket Emission
    // e.g., 'bookings' -> emit 'booking_added'
    const eventName = `${resource.slice(0, -1)}_added`;
    console.log(`[SOCKET] Emitting ${eventName}`);
    io.emit(eventName, newItem);

    res.json(newItem);
});

app.put('/:resource/:id', (req, res, next) => {
    if (req.path.startsWith('/gyms')) return next();
    const { resource, id } = req.params;
    const db = readDB();
    const index = db[resource].findIndex(i => i.id == id);
    if (index !== -1) {
        db[resource][index] = { ...db[resource][index], ...req.body };
        writeDB(db);

        // Dynamic Socket Emission
        const eventName = `${resource.slice(0, -1)}_updated`;
        console.log(`[SOCKET] Emitting ${eventName}`);
        io.emit(eventName, db[resource][index]);

        res.json(db[resource][index]);
    } else {
        res.status(404).send('Not Found');
    }
});

app.delete('/:resource/:id', (req, res, next) => {
    if (req.path.startsWith('/gyms')) return next();
    const { resource, id } = req.params;
    const db = readDB();
    if (!db[resource]) return res.status(404).send('Not Found');
    const initialLength = db[resource].length;
    db[resource] = db[resource].filter(i => i.id != id);
    if (db[resource].length !== initialLength) {
        writeDB(db);
        res.status(204).send();
    } else {
        res.status(404).send('Not Found');
    }
});

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start Server
// Start Server only if running directly (locally)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Socket.IO enabled`);
    });
}

// Export the app for Vercel
module.exports = app;
