const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function init() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        console.log("Connecting to MySQL...");
        const sql = fs.readFileSync('database_setup.sql', 'utf8');
        await connection.query(sql);
        console.log("Database 'nagpur_transit' initialized successfully!");
    } catch (err) {
        console.error("Initialization error:", err.message);
    } finally {
        await connection.end();
    }
}

init();
