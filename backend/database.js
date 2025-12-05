const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// create/connect to database file
const dbPath = path.join(__dirname, "local-grocer.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// create tables
db.serialize(() => {
  // users table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err);
      } else {
        console.log("Users table ready");
      }
    }
  );

  // products table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      emoji TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating products table:", err);
      } else {
        console.log("Products table ready");
        // insert sample products if table is empty
        insertSampleProducts();
      }
    }
  );

  // cart table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating cart table:", err);
      } else {
        console.log("Cart table ready");
      }
    }
  );

  // orders table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating orders table:", err);
      } else {
        console.log("Orders table ready");
      }
    }
  );
});

// insert sample products
function insertSampleProducts() {
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      console.error("Error checking products:", err);
      return;
    }

    // only insert if table is empty
    if (row.count === 0) {
      const products = [
        {
          name: "Wireless Headphones",
          price: 79.99,
          emoji: "🎧",
          description: "High-quality wireless headphones with noise cancellation",
        },
        {
          name: "Laptop",
          price: 899.99,
          emoji: "💻",
          description: "Powerful laptop for work and gaming",
        },
        {
          name: "Smartphone",
          price: 699.99,
          emoji: "📱",
          description: "Latest model with amazing camera",
        },
        {
          name: "Smartwatch",
          price: 299.99,
          emoji: "⌚",
          description: "Track your fitness and stay connected",
        },
        {
          name: "Tablet",
          price: 449.99,
          emoji: "📱",
          description: "Perfect for reading and entertainment",
        },
        {
          name: "Keyboard",
          price: 129.99,
          emoji: "⌨️",
          description: "Mechanical keyboard for better typing",
        },
        {
          name: "Mouse",
          price: 59.99,
          emoji: "🖱️",
          description: "Ergonomic wireless mouse",
        },
        {
          name: "Monitor",
          price: 349.99,
          emoji: "🖥️",
          description: "27-inch 4K display",
        },
        {
          name: "Webcam",
          price: 89.99,
          emoji: "📷",
          description: "HD webcam for video calls",
        },
        {
          name: "Speakers",
          price: 149.99,
          emoji: "🔊",
          description: "Bluetooth speakers with great sound",
        }
      ];


      const stmt = db.prepare(
        "INSERT INTO products(name, price, emoji, description) VALUES (?, ?, ?, ?)"
      );
      products.forEach((product) => {
        stmt.run(
          product.name,
          product.price,
          product.emoji,
          product.description
        );
      });
      stmt.finalize(() => {
        console.log("Sample products inserted");
      });
    }
  });
}

// export database
module.exports = db;
