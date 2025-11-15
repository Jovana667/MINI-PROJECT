// Sample product data
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
    name: "Smart Watch",
    price: 199.99,
    emoji: "⌚",
    description: "Fitness tracking smart watch",
  },
];

// App state
let cart = [];
let currentUser = null;
let allProducts = [...products];

// DOM Elements - will be initialized after DOM loads
let authSection; shopSection, loginBtn, emailInput, passwordInput, authMessage;
let productsGrid, cartBtn, cartCount, cartModal, checkoutModal;
let cartItems, cartTotal, searchInput, searchBtn, checkoutBtn, completeOrderBtn;

// wait for DOM to load

document.addEventListener("DomContentLoaded", function() {
    // query DOM elements
    authSection = document.getElementById("authSection");
    shopSection = document.getElementById("shopSection");
    loginBtn = document.getElementById("loginBtn");
    emailInput = document.getElementById("emailInput");
    passwordInput = document.getElementById("passwordInput");
    authMessage = document.getElementById("authMessage");
    productsGrid = document.getElementById("productsGrid");
    cartBtn = document.getElementById("cartBtn");
    cartCount = document.getElementById("cartCount");
    cartModal = document.getElementById("cartModal");
    checkoutModal = document.getElementById("checkoutModal");
    cartItems = document.getElementById("cartItems");
    cartTotal = document.getElementById("cartTotal");
    searchInput = document.getElementById("searchInput");
    searchBtn = document.getElementById("searchBtn");
    checkoutBtn = document.getElementById("checkoutBtn");
    completeOrderBtn = document.getElementById("completeOrderBtn");

    // event listeners
    loginBtn.addEventListener("click", handleLogin);

    // allow enter key to login
    emailInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") handleLogin();
    });
    passwordInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") handleLogin();
    })

    cartBtn.addEventListener("click", openCart);
    searchBtn.addEventListener("click", handleSearch);
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") handleSearch();
    })
    checkoutBtn.addEventListener("click", openCheckout);
    completeOrderBtn.addEventListener("click", completeOrder);

    // close Modals
    document.querySelector(".close").addEventListener("click", closeCart);
    document.querySelector(".close-checkout").addEventListener("click", closeCheckout);

      // Close modal when clicking outside
window.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCart();
    if (e.target === checkoutModal) closeCheckout();
})
});

// login handler
function handleLogin() {
    console.log("Login button clicked!"); //debug log

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("Email:", email); //debug log
    console.log("Password:", password ? "***" : "(empty)"); //debug log

    if (!email || !password) {
        showAuthMessage("Please enter both email and password", "error");
        return;
    }

    if (!email.includes("@")) {
        showAuthMessage("Please enter a valid email address", "error");
        return;        
}

// simple auth for demo
currentUser = { email: email};
showAuthMessage("Login successful!", "success");

console.log("Login successful, switching to shop view"); //debug log

setTimeout(() => {
    authSection.classList.add("hidden");
    shopSection.classList.remove("hidden");
    displayProducts(allProducts);
}, 1000);
}





