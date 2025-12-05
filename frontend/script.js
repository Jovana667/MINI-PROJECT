// products will be loaded from backend
let products = [];
let allProducts = [];

// App state
let cart = [];
let currentUser = null;

// DOM Elements - will be initialized after DOM loads
let authSection,
  shopSection,
  loginBtn,
  logoutBtn,
  registerBtn,
  emailInput,
  passwordInput,
  authMessage;
let productsGrid, cartBtn, cartCount, cartModal, checkoutModal;
let cartItems, cartTotal, searchInput, searchBtn, checkoutBtn, completeOrderBtn;
let ordersSection, ordersList, backToShopBtn, viewOrdersBtn;

// wait for DOM to load

document.addEventListener("DOMContentLoaded", function () {
  // query DOM elements
  authSection = document.getElementById("authSection");
  shopSection = document.getElementById("shopSection");
  loginBtn = document.getElementById("loginBtn");
  logoutBtn = document.getElementById("logoutBtn");
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
  ordersSection = document.getElementById("ordersSection");
  ordersList = document.getElementById("ordersList");
  backToShopBtn = document.getElementById("backToShopBtn");
  viewOrdersBtn = document.getElementById("viewOrdersBtn");

  // event listeners
  loginBtn.addEventListener("click", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);
  registerBtn.addEventListener("click", handleRegister);
  backToShopBtn.addEventListener("click", backToShop);
  viewOrdersBtn.addEventListener("click", viewOrders);

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
  document.querySelectorAll(".close").forEach((btn) => {
    btn.addEventListener("click", closeCart);
  });
  document.querySelectorAll(".close-checkout").forEach((btn) => {
    btn.addEventListener("click", closeCheckout);
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === cartModal) closeCart();
    if (e.target === checkoutModal) closeCheckout();
  });

  // load products from backend
  async function loadProductsFromBackend() {
    try {
      console.log("Fetching products from backend...");

      const response = await fetch("/api/products");
      const data = await response.json();

      console.log("Products loaded from backend:", data);

      products = data;
      allProducts = [...data];
    } catch (error) {
      console.error("Error loading products:", error);
    }
  }

  loadProductsFromBackend();
});

// login handler

async function handleLogin() {
  console.log("Login button clicked!");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showAuthMessage("Please enter both email and password", "error");
    return;
  }
  if (!email.includes("@")) {
    showAuthMessage("Please enter a valid email address", "error");
    return;
  }
  try {
    // send login request to backend
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      showAuthMessage(data.message, "success");

      setTimeout(() => {
        authSection.classList.add("hidden");
        shopSection.classList.remove("hidden");
        console.log("Displaying products, allProducts:", allProducts);
        displayProducts(products);
      }, 1000);
    } else {
      showAuthMessage(data.message, "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAuthMessage("Login failed. Please try again.", "error");
  }
}

// register handler

async function handleRegister() {
  console.log("Register button clicked!");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showAuthMessage("please enter both email and password", "error");
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

  try {
    // send rregister request to backend
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      console.log("User registered, currentUser:", currentUser);
      showAuthMessage(data.message, "success");

      // new user - cart empty
      cart = [];
      updateCartCount();

      setTimeout(() => {
        authSection.classList.add("hidden");
        shopSection.classList.remove("hidden");
        displayProducts(allProducts);
      }, 1000);
    } else {
      showAuthMessage(data.message, "error");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showAuthMessage("Registration failed. Please try again.", "error");
  }
}

function showAuthMessage(message, type) {
  authMessage.textContent = message;
  authMessage.style.color = type === "success" ? "green" : "red";
}

// log out handler

function handleLogout() {
  console.log("Logout button clicked!");

  currentUser = null;
  setTimeout(() => {
    authMessage.textContent = "Logged out successfully";
  }, 1000);
  // clear cart on logout
  cart = [];
  products = [];
  allProducts = [];
  updateCartCount();

  // clear inputs
  emailInput.value = "";
  passwordInput.value = "";

  setTimeout(() => {
    ordersSection.classList.add("hidden");
    authSection.classList.remove("hidden");
    shopSection.classList.add("hidden");
  }, 1000);
}

// Display products
async function displayProducts(productsToShow) {
  // clear old products
  productsGrid.innerHTML = "";

  // Show each product
  for (const product of productsToShow) {
    // Create product card
    const productCard = document.createElement("div");
    productCard.className = "card product-card";

    // Start with emoji as default
    let imageHtml = `<div class="product-image text-center">${product.emoji}</div>`;

    // Try to fetch product image from Unsplash
    try {
      const imgResponse = await fetch(`/api/product-image/${product.name}`);
      const imgData = await imgResponse.json();

      if (imgData.imageUrl) {
        // Use real image if available
        imageHtml = `<img src="${imgData.imageUrl}" alt="${product.name}" class="product-image-photo" />`;
      }
    } catch (error) {
      console.error("Error fetching image:", error);
      // Keep emoji if image fails
    }

    // Build card HTML
    productCard.innerHTML = `
        <div class="card-body">
          ${imageHtml}
          <h5 class="card-title">${product.name}</h5>
          <p class="card-text">${product.description}</p>
        </div>
        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center">
            <span class="product-price fw-bold text-success">$${product.price.toFixed(
              2
            )}</span>
            <button class="btn btn-primary btn-sm" onclick="addToCart(${
              product.id
            })">
              Add to Cart
            </button>
          </div>
        </div>
    `;

    productsGrid.appendChild(productCard);
  }

  // Show message if no products
  if (productsToShow.length === 0) {
    productsGrid.innerHTML =
      '<p style="grid-column:1/-1; text-align: center; padding:40px;">No products found.</p>';
  }
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
      product.description.toLowerCase().includes(searchTerm)
  );

  displayProducts(filteredProducts);
}

// add to cart
async function addToCart(productId) {
  console.log("addToCart called with productId:", productId);
  console.log("currentUser:", currentUser);

  if (!currentUser || !currentUser.id) {
    console.log("No user logged in or user has no ID");
    showNotification("Please login first!");
    return;
  }

  const product = products.find((p) => p.id == productId);
  console.log("Found product:", product);

  if (!product) {
    console.log("Product not found!");
    return;
  }

  try {
    // Save to database
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
        productId: productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Update local cart
      const existingItem = cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }

      console.log("Cart after adding:", cart);
      updateCartCount();
      showNotification("Added to cart!");
    } else {
      showNotification("Failed to add to cart");
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    showNotification("Error adding to cart");
  }
}

// update cart count
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
    right: 20px;
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
  console.log("openCart called, cart length:", cart.length);
  console.log("cart contents:", cart);

  if (cart.length === 0) {
    showNotification("Your cart is empty!");
    return;
  }

  displayCartItems();
  cartModal.classList.remove("hidden");
  cartModal.classList.add("active");
  console.log("Cart modal should be visible now");
}

// close cart modal
function closeCart() {
  cartModal.classList.remove("active");
  cartModal.classList.add("hidden");
}

// display cart items
function displayCartItems() {
  cartItems.innerHTML = "";

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="decrementQuantity(${
            item.id
          })">-</button>
          <span class="quantity">${item.quantity}</span>
          <button class="qty-btn" onclick="incrementQuantity(${
            item.id
          })">+</button>
        </div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(
          2
        )}</div>
        <button class="remove-btn" onclick="removeFromCart(${
          item.id
        })">Remove</button>
      </div>
    `;

    cartItems.appendChild(cartItem);
  });

  updateCartTotal();
}

// update cart total
function updateCartTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = total.toFixed(2);
}

// Increment cart item quantity
async function incrementQuantity(productId) {
  if (!currentUser || !currentUser.id) {
    return;
  }

  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  try {
    // Update in database (if item has a cart database ID)
    if (item.cartId) {
      const response = await fetch(`/api/cart/${item.cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity + 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local cart
        item.quantity += 1;
        displayCartItems();
        updateCartCount();
      }
    } else {
      // Fallback if no cartId
      item.quantity += 1;
      displayCartItems();
      updateCartCount();
    }
  } catch (error) {
    console.error("Error incrementing quantity:", error);
  }
}

// Decrement cart item quantity
async function decrementQuantity(productId) {
  if (!currentUser || !currentUser.id) {
    return;
  }

  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  // If quantity is 1, remove item instead
  if (item.quantity === 1) {
    removeFromCart(productId);
    return;
  }

  try {
    // Update in database
    if (item.cartId) {
      const response = await fetch(`/api/cart/${item.cartId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: item.quantity - 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local cart
        item.quantity -= 1;
        displayCartItems();
        updateCartCount();
      }
    } else {
      // Fallback
      item.quantity -= 1;
      displayCartItems();
      updateCartCount();
    }
  } catch (error) {
    console.error("Error decrementing quantity:", error);
  }
}

// Remove item from cart
async function removeFromCart(productId) {
  if (!currentUser || !currentUser.id) {
    return;
  }

  const item = cart.find((item) => item.id === productId);
  if (!item) return;

  try {
    // Remove from database if item has cartId
    if (item.cartId) {
      await fetch(`/api/cart/${item.cartId}`, {
        method: "DELETE",
      });
    }

    // Remove from local cart array
    cart = cart.filter((item) => item.id !== productId);

    // Update display
    displayCartItems();
    updateCartCount();
    showNotification("Item removed from cart");
  } catch (error) {
    console.error("Error removing from cart:", error);
  }
}

// open chekout
function openCheckout() {
  closeCart();
  checkoutModal.classList.add("active");
}

// close checkout
function closeCheckout() {
  checkoutModal.classList.remove("active");
}

// complete order
async function completeOrder() {
  const name = document.getElementById("nameInput").value.trim();
  const address = document.getElementById("addressInput").value.trim();
  const card = document.getElementById("cardInput").value.trim();
  const checkoutMessage = document.getElementById("checkoutMessage");

  if (!name || !address || !card) {
    checkoutMessage.textContent = "Please fill in all fields.";
    checkoutMessage.style.color = "red";
    return;
  }

  if (card.length < 13) {
    checkoutMessage.textContent = "Please enter a valid card number.";
    checkoutMessage.style.color = "red";
    return;
  }

  try {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Save order to database
    if (currentUser && currentUser.id) {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          total: total,
          name: name,
          address: address,
          items: cart,
        }),
      });

      const orderData = await orderResponse.json();
      console.log("Order saved:", orderData);

      // Clear cart in database
      await fetch(`/api/cart/${currentUser.id}`, {
        method: "DELETE",
      });
    }

    // Show success message
    checkoutMessage.textContent = "Order completed successfully!";
    checkoutMessage.style.color = "green";

    setTimeout(() => {
      cart = [];
      updateCartCount();
      closeCheckout();
      showNotification("Thank you for your purchase!");

      // Clear form
      document.getElementById("nameInput").value = "";
      document.getElementById("addressInput").value = "";
      document.getElementById("cardInput").value = "";
      checkoutMessage.textContent = "";
    }, 2000);
  } catch (error) {
    console.error("Error completing order:", error);
    checkoutMessage.textContent = "Order failed. Please try again.";
    checkoutMessage.style.color = "red";
  }
}

// ========== ORDER HISTORY FUNCTIONS ==========

// View order history
async function viewOrders() {
  if (!currentUser || !currentUser.id) {
    showNotification("Please login first!");
    return;
  }

  try {
    const response = await fetch(`/api/orders/${currentUser.id}`);
    const orders = await response.json();

    console.log("Orders loaded:", orders);

    // Hide shop, show orders
    shopSection.classList.add("hidden");
    ordersSection.classList.remove("hidden");

    displayOrders(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    showNotification("Failed to load orders");
  }
}

// Display order history
function displayOrders(orders) {
  ordersList.innerHTML = "";

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="no-orders">
        <div class="no-orders-icon">📦</div>
        <p>No orders yet!</p>
        <p>Start shopping to place your first order.</p>
      </div>
    `;
    return;
  }

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";

    const orderDate = new Date(order.created_at);
    const formattedDate = orderDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    orderCard.innerHTML = `
      <h3>Order #${order.id}</h3>
      <p><strong>Date:</strong> ${formattedDate}</p>
      <p><strong>Name:</strong> ${order.name}</p>
      <p><strong>Address:</strong> ${order.address}</p>
      <p><strong>Total:</strong> <span style="color: #28a745; font-size: 20px; font-weight: bold;">$${order.total.toFixed(
        2
      )}</span></p>
      <p><strong>Status:</strong> <span class="order-status">${
        order.status
      }</span></p>
    `;

    ordersList.appendChild(orderCard);
  });
}

// Go back to shop
function backToShop() {
  ordersSection.classList.add("hidden");
  shopSection.classList.remove("hidden");
}

// add CSS animation
const style = document.createElement("style");
style.textContent = `
@keyframe slideIn {
from {
transform: translateX(100%);
opacity: 0;
}
to {
transform: X(0);
opacity: 1;
}
}`;
document.head.appendChild(style);
