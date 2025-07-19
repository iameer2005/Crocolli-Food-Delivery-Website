let cart = {};
let totalPrice = 0;
let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];

const cartCountEl = document.getElementById("cart-count");
const cartItemsEl = document.getElementById("cart-items");
const totalPriceEl = document.getElementById("total-price");
const placeOrderBtn = document.getElementById("place-order");

const addToCartButtons = document.querySelectorAll(".item-all button");

addToCartButtons.forEach(button => {
  button.addEventListener("click", () => {
    const itemContainer = button.parentElement;
    const itemName = itemContainer.querySelector("p").textContent.trim();
    const itemPriceText = itemContainer.querySelector(".price-item").textContent.trim();
    const itemPrice = parseInt(itemPriceText.match(/\d+/)[0]);

    if (cart[itemName]) {
      cart[itemName].quantity += 1;
    } else {
      cart[itemName] = {
        quantity: 1,
        pricePerItem: itemPrice
      };
    }

    totalPrice += itemPrice;
    updateCartUI();
  });
});

function updateCartUI() {
  let totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCountEl.textContent = totalItems;

  cartItemsEl.innerHTML = '';

  for (const item in cart) {
    const { quantity, pricePerItem } = cart[item];
    const itemTotal = quantity * pricePerItem;

    const li = document.createElement("li");
    li.innerHTML = `${item} x${quantity} - ₹${itemTotal} 
      <button class="remove-btn" data-item="${item}">x</button>`;
    cartItemsEl.appendChild(li);
  }

  totalPriceEl.textContent = `Total: ₹${totalPrice}`;

  const removeButtons = document.querySelectorAll(".remove-btn");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const itemToRemove = btn.getAttribute("data-item");
      if (cart[itemToRemove]) {
        cart[itemToRemove].quantity -= 1;
        totalPrice -= cart[itemToRemove].pricePerItem;

        if (cart[itemToRemove].quantity <= 0) {
          delete cart[itemToRemove];
        }

        updateCartUI();
      }
    });
  });
}

placeOrderBtn.addEventListener("click", () => {
  if (Object.keys(cart).length === 0) {
    alert("Your cart is empty!");
  } else {
    document.getElementById("order-popup").style.display = "flex";
  }
});

function closePopup() {
  document.getElementById("order-popup").style.display = "none";
}

document.getElementById("order-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const userName = document.getElementById("user-name").value.trim();
  const userPhone = document.getElementById("user-phone").value.trim();
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  let summary = Object.entries(cart).map(([item, data]) => {
    return `${item} x${data.quantity} - ₹${data.quantity * data.pricePerItem}`;
  }).join("\n");

  alert(`Order Confirmed!\n\nName: ${userName}\nPhone: ${userPhone}\nPayment: ${paymentMethod}\n\nItems:\n${summary}\n\nTotal: ₹${totalPrice}`);

  // Save to order history
  orderHistory.push({
    name: userName,
    phone: userPhone,
    payment: paymentMethod,
    items: JSON.parse(JSON.stringify(cart)),
    total: totalPrice,
    date: new Date().toLocaleString()
  });
  localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

  // Reset cart
  cart = {};
  totalPrice = 0;
  updateCartUI();
  closePopup();
});

//Show Order History 
document.querySelectorAll(".order-history-link").forEach(link => {
  link.addEventListener("click", () => {
    const historyList = document.getElementById("order-history-list");
    historyList.innerHTML = '';

    if (orderHistory.length === 0) {
      historyList.innerHTML = '<li>No previous orders found.</li>';
    } else {
      orderHistory.forEach(order => {
        const li = document.createElement("li");
        const itemList = Object.entries(order.items)
          .map(([item, data]) => `${item} x${data.quantity}`)
          .join(", ");
        li.textContent = `${order.date} - ${order.name} - ₹${order.total} - [${itemList}]`;
        historyList.appendChild(li);
      });
    }

    document.getElementById("order-history-popup").style.display = "flex";
  });
});

function closeHistoryPopup() {
  document.getElementById("order-history-popup").style.display = "none";
}

// Hamburger menu toggle
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// Search Event
document.getElementById("search-button").addEventListener("click", () => {
  const query = document.getElementById("search-input").value.toLowerCase().trim();
  const items = document.querySelectorAll(".item-all");

  let matchFound = false;

  items.forEach(item => {
    const name = item.querySelector("p").textContent.toLowerCase();
    if (name.includes(query)) {
      item.style.display = "block";
      matchFound = true;
    } else {
      item.style.display = "none";
    }
  });

  if (!matchFound) {
    if (!document.getElementById("no-results")) {
      const noResults = document.createElement("div");
      noResults.id = "no-results";
      noResults.textContent = "No results found.";
      noResults.style.color = "#ff570a";
      noResults.style.fontSize = "1.5rem";
      noResults.style.textAlign = "center";
      noResults.style.marginTop = "20px";
      document.querySelector("#menu-section").appendChild(noResults);
    }
  } else {
    const existing = document.getElementById("no-results");
    if (existing) existing.remove();
  }
});

document.getElementById("search-input").addEventListener("input", () => {
  if (document.getElementById("search-input").value.trim() === "") {
    document.querySelectorAll(".item-all").forEach(item => {
      item.style.display = "block";
    });
    const existing = document.getElementById("no-results");
    if (existing) existing.remove();
  }
});
