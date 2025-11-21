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
let authSection,
  shopSection,
  loginBtn,
  registerBtn,
  emailInput,
  passwordInput,
  authMessage;
let productsGrid, cartBtn, cartCount, cartModal, checkoutModal;
let cartItems, cartTotal, searchInput, searchBtn, checkoutBtn, completeOrderBtn;

// wait for DOM to load

document.addEventListener("DOMContentLoaded", function () {
  // query DOM elements
  authSection = document.getElementById("authSection");
  shopSection = document.getElementById("shopSection");
  loginBtn = document.getElementById("loginBtn");
  registerBtn = document.getElementById("registerBtn");
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
  registerBtn.addEventListener("click", handleRegister);

  // allow enter key to login
  emailInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  passwordInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  cartBtn.addEventListener("click", openCart);
  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleSearch();
  });
  checkoutBtn.addEventListener("click", openCheckout);
  completeOrderBtn.addEventListener("click", completeOrder);

  // close Modals
  document.querySelector(".close").addEventListener("click", closeCart);
  document
    .querySelector(".close-checkout")
    .addEventListener("click", closeCheckout);

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCart();
    if (e.target === checkoutModal) closeCheckout();
  });
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
  currentUser = { email: email };
  showAuthMessage("Login successful!", "success");

  console.log("Login successful, switching to shop view"); //debug log

  setTimeout(() => {
    authSection.classList.add("hidden");
    shopSection.classList.remove("hidden");
    displayProducts(allProducts);
  }, 1000);
}

function handleRegister() {
  console.log("Register button clicked!"); //debug log

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

  if (password.length < 6) {
    showAuthMessage("Password must be at least 6 characters", "error");
    return;
  }

  // simple registration for demo
  currentUser = { email: email };
  showAuthMessage("Registration successful!", "success");

  console.log("Registration successful, switching to shop view"); //debug log

  setTimeout(() => {
    authSection.classList.add("hidden");
    shopSection.classList.remove("hidden");
    displayProducts(allProducts);
  }, 1000);
}

function showAuthMessage(message, type) {
  authMessage.textContent = message;
  authMessage.style.color = type === "success" ? "green" : "red";
}

// Display products
function displayProducts(productsToShow) {
  // clear old products
  productsGrid.innerHTML = "";

  productsToShow.forEach((product) => {
    // for each product create...
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    // create a div with a class name of product-card
    productCard.innerHTML = `
        <div class="product-image">${product.emoji}</div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
        Add to Cart
        </button>
        `;
    // fill it with HTML including product details and an add to cart button
    productsGrid.appendChild(productCard);
  });
  // add to page

  if (productsToShow.length === 0) {
    productsGrid.innerHTML =
      '<p style="grid-column:1/-1; text-align: center; padding:40px;">No products found.</p>';
  }
  // show this message if there are no products
}

// Search Handler
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();

    if (!searchTerm) {
        displayProducts(allProducts);
        return;
    }

    const filteredProducts = allProducts.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm) ||
        products.description.toLowerCase().includes(searchTerm)
    );
    
    displayProducts(filteredProducts);
}

// add to cart
function addToCart(productId) {
    const product = products.find((p) => p.id == productId);

    if (!product) return;

    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...product, quantity:1});
    }

    updateCartCount();
    showNotification("Added to cart!");
}

//update cart count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// show notification
function showNotification(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right:20px;
    background: pink;
    color: black;
    padding: 15px 25px;
    border-radius: 5px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 2000;
    animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// open cart modal
function openCart() {
  if (cart.length === 0) {
    showNotification("Your cart is empty!");
    return;
  }

  disaplyCartItems();
  cartModal.classList.add("active");
}

// close cart modal
function closeCart() {
  cartModal.classList.remove("active");
}

// display cart items
function displayCartItems() {
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
    <div class=cart-item-info">
    <div class="cart-item-name>${item.name} (x${item.quantity})</div>
    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>`;
    
    cartItems.appendChild(cartItem);
  });

  updateCartTotal();
}

// remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !++ productId);
  updateCartCount();

  if (cart.length === 0) {
    closeCart();
    return;
}

displayCartItems();
}

// update cart total
function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = total.toFixed(2);
}

// open chekout
function openCheckout(){
  closeCart();
  checkoutModal.classList.add("active");    
}

// close checkout
function closeCheckout() {
  checkoutModal.classList.remove("active"); 
}