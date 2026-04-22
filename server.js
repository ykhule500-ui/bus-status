const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from the project root

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ---- Helper: Format Bus with Routes ----
async function getBusesWithRoutes() {
    const [buses] = await pool.query('SELECT * FROM buses');
    const [routes] = await pool.query('SELECT * FROM bus_routes ORDER BY bus_id, stop_order');
    
    return buses.map(bus => {
        return {
            ...bus,
            route: routes.filter(r => r.bus_id === bus.id).map(r => r.stop_name)
        };
    });
}

// ---- API: Get All Buses ----
app.get('/api/buses', async (req, res) => {
    try {
        const buses = await getBusesWithRoutes();
        res.json(buses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- API: Add Bus (Admin) ----
app.post('/api/buses', async (req, res) => {
    const { id, name, departure_time, arrival_time, fare, total_seats, status, route } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.query(
            'INSERT INTO buses (id, name, departure_time, arrival_time, fare, total_seats, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, departure_time, arrival_time, fare, total_seats, status]
        );

        if (route && route.length > 0) {
            const routeValues = route.map((stop, index) => [id, stop, index + 1]);
            await connection.query(
                'INSERT INTO bus_routes (bus_id, stop_name, stop_order) VALUES ?',
                [routeValues]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Bus added successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ---- API: Update Bus ----
app.put('/api/buses/:id', async (req, res) => {
    const { name, departure_time, arrival_time, fare, total_seats, status, route } = req.body;
    const busId = req.params.id;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        await connection.query(
            'UPDATE buses SET name = ?, departure_time = ?, arrival_time = ?, fare = ?, total_seats = ?, status = ? WHERE id = ?',
            [name, departure_time, arrival_time, fare, total_seats, status, busId]
        );

        if (route) {
            await connection.query('DELETE FROM bus_routes WHERE bus_id = ?', [busId]);
            if (route.length > 0) {
                const routeValues = route.map((stop, index) => [busId, stop, index + 1]);
                await connection.query(
                    'INSERT INTO bus_routes (bus_id, stop_name, stop_order) VALUES ?',
                    [routeValues]
                );
            }
        }

        await connection.commit();
        res.json({ message: 'Bus updated successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// ---- API: Delete Bus ----
app.delete('/api/buses/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM buses WHERE id = ?', [req.params.id]);
        res.json({ message: 'Bus deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- API: Login ----
app.post('/api/auth/login', async (req, res) => {
    const { phone, password, role } = req.body;
    try {
        const table = role === 'admin' ? 'admins' : 'passengers';
        const [users] = await pool.query(`SELECT * FROM ${table} WHERE phone = ? AND password = ?`, [phone, password]);
        
        if (users.length > 0) {
            const user = users[0];
            delete user.password;
            res.json({ ...user, role });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- API: Signup ----
app.post('/api/auth/signup', async (req, res) => {
    const { name, phone, password, role } = req.body;
    try {
        const table = role === 'admin' ? 'admins' : 'passengers';
        await pool.query(
            `INSERT INTO ${table} (name, phone, password) VALUES (?, ?, ?)`,
            [name, phone, password]
        );
        res.status(201).json({ message: 'Account created successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ message: 'Phone number already registered' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

// ---- API: Get Bookings (Admin) ----
app.get('/api/bookings', async (req, res) => {
    try {
        const query = `
            SELECT b.id, p.name as passenger, p.phone, bus.name as busName, b.bus_id as busId, b.booked_at
            FROM bookings b
            JOIN passengers p ON b.passenger_id = p.id
            JOIN buses bus ON b.bus_id = bus.id
            ORDER BY b.booked_at DESC
        `;
        const [bookings] = await pool.query(query);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- API: Get Passengers (Admin) ----
app.get('/api/passengers', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT name, phone, created_at FROM passengers ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ---- API: Get Stats (Admin) ----
app.get('/api/stats', async (req, res) => {
    try {
        const [[{ total_buses }]] = await pool.query('SELECT COUNT(*) as total_buses FROM buses');
        const [[{ active_buses }]] = await pool.query('SELECT COUNT(*) as active_buses FROM buses WHERE status = "active"');
        const [[{ total_users }]] = await pool.query('SELECT COUNT(*) as total_users FROM passengers');
        const [[{ total_bookings }]] = await pool.query('SELECT COUNT(*) as total_bookings FROM bookings');
        
        res.json({ total_buses, active_buses, total_users, total_bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
