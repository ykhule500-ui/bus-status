const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function runBulk() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log("Running bulk seed...");
        const sql = fs.readFileSync('bulk_seed.sql', 'utf8');
        await connection.query(sql);
        console.log("50 bus entries added successfully!");
    } catch (err) {
        console.error("Bulk seed error:", err.message);
    } finally {
        await connection.end();
    }
}

runBulk();
