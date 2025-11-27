const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// create/connect to database file
const dbPath = path.join(__dirname, 'local-grocer.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
        } else {
            console.log('Connected to SQLite database.');
    }
});

// create tables
db.serialize(() => {
    // users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEAFULT CURRENT_TIMESTAMP
    )
        `, (err) => {
            if (err) {
console.error('Error creating users table:', err);
            } else {
                console.log('Users table ready');
            }
            });

            // products table
            db.run(`
                CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                emoji TEXT,
                description TEXT,
                create_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
                `, (err) => {
                    console.error('Error creating products table:', err);
                } else {
                    console.log('Products table ready');
                    // insert sample products if table is empty
                    insertSampleProducts();
                }
                )});

                