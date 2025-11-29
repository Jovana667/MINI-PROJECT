// Import Express
const express = require("express");
const path = require("path");
const db = require("./database");
const app = express();
const PORT = 3000;

// middleware to parse JSON
app.use(express.json());

// server frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// routes
// get all products from database
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: "Failed to retrieve products" });
    } else {
      res.json(rows);
    }
  });
});

// test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// register new user
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password required" });
  }
  if (password.length < 6) {
    return res.json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // check if user already exists
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ success: false, message: "Database error" });
    }
    if (row) {
      return res.json({ success: false, message: "Email already registered" });
    }
    // inser new user
    db.run(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, password],
      function (err) {
        if (err) {
          console.error("Error creating user:", err);
          return res.json({ success: false, message: "Failed to create user" });
        }
        res.json({
          success: true,
          message: "Registration successful!",
          user: { id: this.lastID, email: email },
        });
      }
    );
  });
});

// login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password required" });
  }

  // find user in database
  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return res.json({ success: false, message: "Database error" });
      }
      if (!row) {
        return res.json({
          success: false,
          message: "Inavlid email or password",
        });
      }
      res.json({
        success: true,
        message: "Login successful!",
        user: { id: row.id, email: row.email },
      });
    }
  );
});

// get users cart
app.get("/api/cart/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    `
        SELECT cart.id, cart.quantity, products.*
        FROM cart
        JOIN products ON cart.products_id = products.id
        WHERE cart.user_id = ?
        `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching cart:", err);
        res.status(500).json({ error: "Failed to fetch cart" });
      } else {
        res.json(rows);
      }
    }
  );
});

// add item to cart
app.post("/api/cart", (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId) {
    return resizeTo.json({ success: false, message: "Missing data" });
  }

  // check if item already in cart
  db.get(
    "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    (err, row) => {
      if (err) {
        console.error("Error checking cart:", err);
        return res.json({ success: false, message: "Database error" });
      }

      if (row) {
        // item exists, update quantity
        db.run(
          "UPDATE cart SET quantity = quantity + ? WHERE id = ?",
          [quantity || 1, row.id],
          (err) => {
            if (err) {
              console.error("Error updating cart:", err);
              return res.json({
                success: false,
                message: "Failed to update cart",
              });
            }
            res.json({ success: true, message: "Cart updated" });
          }
        );
      } else {
        // new item insert
        db.run(
          "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, productId, quantity || 1],
          (err) => {
            if (err) {
              console.error("Error adding to cart:", err);
              return res.json({
                success: false,
                message: "Failed to add to cart",
              });
            }
            res.json({ success: true, message: "Item added to cart" });
          }
        );
      }
    }
  );
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API Products: http://localhost:${PORT}/api/products`);
  console.log(`API Test: http://localhost:${PORT}/api/test`);
});
