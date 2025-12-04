const express = require("express");
const path = require("path");
const db = require("./database");
const bcrypt = require("bcrypt");
const fetch = require("node-fetch");
const cors = require("cors"); // ← ADD THIS
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());
console.log("CORS enabled");

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

// ========== UPDATED REGISTRATION ROUTE ==========
app.post("/api/register", async (req, res) => {
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

  try {
    // Check if user already exists
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
      if (err) {
        console.error("Database error:", err);
        return res.json({ success: false, message: "Database error" });
      }

      if (row) {
        return res.json({
          success: false,
          message: "Email already registered",
        });
      }

      // Hash password with bcrypt (10 salt rounds)
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Original password:", password);
      console.log("Hashed password:", hashedPassword);

      // Insert new user with hashed password
      db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        function (err) {
          if (err) {
            console.error("Error creating user:", err);
            return res.json({
              success: false,
              message: "Failed to create user",
            });
          }

          console.log("User created with ID:", this.lastID);
          res.json({
            success: true,
            message: "Registration successful!",
            user: { id: this.lastID, email: email },
          });
        }
      );
    });
  } catch (error) {
    console.error("Bcrypt error:", error);
    res.json({ success: false, message: "Server error" });
  }
});

// ========== UPDATED LOGIN ROUTE ==========
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password required" });
  }

  // Find user in database
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.json({ success: false, message: "Database error" });
    }

    if (!row) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    try {
      // Compare entered password with hashed password in database
      const match = await bcrypt.compare(password, row.password);

      console.log("Password match:", match);

      if (!match) {
        return res.json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Password correct!
      res.json({
        success: true,
        message: "Login successful!",
        user: { id: row.id, email: row.email },
      });
    } catch (error) {
      console.error("Password comparison error:", error);
      res.json({ success: false, message: "Server error" });
    }
  });
});

// get users cart
app.get("/api/cart/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    `
        SELECT cart.id, cart.quantity, products.*
        FROM cart
        JOIN products ON cart.product_id = products.id
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
    return res.json({ success: false, message: "Missing data" });
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

// Remove item from cart
app.delete("/api/cart/:userId/:productId", (req, res) => {
  const { userId, productId } = req.params;

  db.run(
    "DELETE FROM cart WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    (err) => {
      if (err) {
        console.error("Error removing from cart:", err);
        return res.json({
          success: false,
          message: "Failed to remove from cart",
        });
      }
      res.json({ success: true, message: "Removed from cart" });
    }
  );
});

// Clear entire cart
app.delete("/api/cart/:userId", (req, res) => {
  const userId = req.params.userId;

  db.run("DELETE FROM cart WHERE user_id = ?", [userId], (err) => {
    if (err) {
      console.error("Error clearing cart:", err);
      return res.json({ success: false, message: "Failed to clear cart" });
    }
    res.json({ success: true, message: "Cart cleared" });
  });
});

// Save order to database
app.post("/api/orders", (req, res) => {
  const { userId, total, name, address, items } = req.body;

  if (!userId || !total || !name || !address) {
    return res.json({ success: false, message: "Missing order data" });
  }

  // Insert order
  db.run(
    `
    INSERT INTO orders (user_id, total, name, address, status)
    VALUES (?, ?, ?, ?, 'completed')
  `,
    [userId, total, name, address],
    function (err) {
      if (err) {
        console.error("Error saving order:", err);
        return res.json({ success: false, message: "Failed to save order" });
      }

      console.log("Order saved with ID:", this.lastID);
      res.json({
        success: true,
        message: "Order saved",
        orderId: this.lastID,
      });
    }
  );
});

// Get user's order history
app.get("/api/orders/:userId", (req, res) => {
  const userId = req.params.userId;

  db.all(
    `
    SELECT * FROM orders 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `,
    [userId],
    (err, rows) => {
      if (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
      } else {
        res.json(rows);
      }
    }
  );
});

// Update cart item quantity
app.put("/api/cart/:cartItemId", (req, res) => {
  const { quantity } = req.body;
  const cartItemId = req.params.cartItemId;

  if (!quantity || quantity < 1) {
    return res.json({ success: false, message: "Invalid quantity" });
  }

  db.run(
    "UPDATE cart SET quantity = ? WHERE id = ?",
    [quantity, cartItemId],
    (err) => {
      if (err) {
        console.error("Error updating cart:", err);
        return res.json({ success: false, message: "Failed to update" });
      }
      res.json({ success: true, message: "Quantity updated" });
    }
  );
});

// Get products sorted by price or name
app.get("/api/products/sorted", (req, res) => {
  const sortBy = req.query.sortBy || "name"; // 'name' or 'price'
  const order = req.query.order || "ASC"; // 'ASC' or 'DESC'

  // Validate inputs to prevent SQL injection
  const validSortBy = ["name", "price"].includes(sortBy) ? sortBy : "name";
  const validOrder = ["ASC", "DESC"].includes(order.toUpperCase())
    ? order.toUpperCase()
    : "ASC";

  db.all(
    `SELECT * FROM products ORDER BY ${validSortBy} ${validOrder}`,
    [],
    (err, rows) => {
      if (err) {
        console.error("Error fetching sorted products:", err);
        res.status(500).json({ error: "Failed to fetch products" });
      } else {
        res.json(rows);
      }
    }
  );
});

// Get product image from Unsplash
app.get("/api/product-image/:productName", async (req, res) => {
  const productName = req.params.productName;
  const accessKey = "XdU2APzTQgIpSbddfHZxAz7_34cDjEXfvF_hiN0d6NE"; // REPLACE WITH YOUR KEY!

  try {
    console.log(`Fetching image for: ${productName}`);

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${productName}&per_page=1&client_id=${accessKey}`
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const imageUrl = data.results[0].urls.regular; // Get high-quality image
      console.log(`Image found: ${imageUrl}`);
      res.json({ imageUrl: imageUrl });
    } else {
      console.log(`No image found for: ${productName}`);
      res.json({ imageUrl: null });
    }
  } catch (error) {
    console.error("Unsplash API error:", error);
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API Products: http://localhost:${PORT}/api/products`);
  console.log(`API Test: http://localhost:${PORT}/api/test`);
});
