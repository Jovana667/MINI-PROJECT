// Import Express
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// middleware to parse JSON
app.use(express.json());

// server frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// routes
// get all products
app.get("/api/products", (req, res) => {
  const products = [
    {
      id: 1,
      name: "Wireless Headphones",
      price: 79.99,
      emoji: "🎧",
      description: "High-quality wireless headphones",
    },
    {
      id: 2,
      name: "Laptop",
      price: 899.99,
      emoji: "💻",
      description: "Powerful and portable laptop",
    },
  ];

  res.json(products);
});

// test routes
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

// start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API Products: http://localhost:${PORT}/api/products`);
  console.log(`API Test: http://localhost:${PORT}/api/test`);
});
