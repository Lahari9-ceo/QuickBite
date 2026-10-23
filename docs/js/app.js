let menuItems = [];
let cart = [];
let selectedOrderType = 'dine_in';
let currentItem = null;
let currentQty = 1;
let selectedCustomizations = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchMenu();
});

function setOrderType(type) {
  selectedOrderType = type;
  document.getElementById('btn-dinein').classList.toggle('active', type === 'dine_in');
  document.getElementById('btn-takeout').classList.toggle('active', type === 'takeout');
}

async function fetchMenu() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/menu`);
    const data = await res.json();
    menuItems = data.data || [];
    renderCategories();
    renderMenu('All');
  } catch (err) {
    console.warn('Backend unavailable, using fallback mock data inside controller logic.');
    renderCategories();
  }
}

function renderCategories() {
  const container = document.getElementById('categories-container');
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];
  
  container.innerHTML = categories.map((cat, idx) => `
    <button class="cat-btn ${idx === 0 ? 'active' : ''}" onclick="filterCategory('${cat}', this)">${cat}</button>
  `).join('');
}

function filterCategory(category, btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('category-title').innerText = `${category} Items`;
  renderMenu(category);
}

function renderMenu(category) {
  const grid = document.getElementById('menu-grid');
  const filtered = category === 'All' ? menuItems : menuItems.filter(i => i.category === category);

  grid.innerHTML = filtered.map(item => `
    <div class="menu-card" onclick="openCustomModal(${item.id})">
      <img src="${item.image_url}" alt="${item.name}">
      <div class="menu-card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <span class="price-tag">$${parseFloat(item.price).toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function openCustomModal(itemId) {
  currentItem = menuItems.find(i => i.id === itemId);
  currentQty = 1;
  selectedCustomizations = [];

  document.getElementById('modal-img').src = currentItem.image_url;
  document.getElementById('modal-title').innerText = currentItem.name;
  document.getElementById('modal-desc').innerText = currentItem.description;
  document.getElementById('modal-qty').innerText = currentQty;

  const optionsContainer = document.getElementById('modal-options');
  const customs = typeof currentItem.customizations === 'string' 
    ? JSON.parse(currentItem.customizations) 
    : currentItem.customizations || [];

  optionsContainer.innerHTML = customs.map((c, idx) => `
    <label class="custom-option">
      <div>
        <input type="checkbox" onchange="toggleCustomization(${idx}, '${c.name}', ${c.price})">
        <span>${c.name}</span>
      </div>
      <span>+$${parseFloat(c.price).toFixed(2)}</span>
    </label>
  `).join('');

  updateModalPrice();
  document.getElementById('custom-modal').classList.add('active');
}

function closeCustomModal() {
  document.getElementById('custom-modal').classList.remove('active');
}

function toggleCustomization(idx, name, price) {
  const index = selectedCustomizations.findIndex(c => c.name === name);
  if (index > -1) {
    selectedCustomizations.splice(index, 1);
  } else {
    selectedCustomizations.push({ name, price });
  }
  updateModalPrice();
}

function changeModalQty(delta) {
  if (currentQty + delta >= 1) {
    currentQty += delta;
    document.getElementById('modal-qty').innerText = currentQty;
    updateModalPrice();
  }
}

function updateModalPrice() {
  const extraCost = selectedCustomizations.reduce((sum, c) => sum + parseFloat(c.price), 0);
  const total = (parseFloat(currentItem.price) + extraCost) * currentQty;
  document.getElementById('modal-total-price').innerText = `$${total.toFixed(2)}`;
}

function confirmAddToCart() {
  const extraCost = selectedCustomizations.reduce((sum, c) => sum + parseFloat(c.price), 0);
  const itemPrice = parseFloat(currentItem.price) + extraCost;

  cart.push({
    id: currentItem.id,
    name: currentItem.name,
    quantity: currentQty,
    price: itemPrice,
    selectedCustomizations: [...selectedCustomizations]
  });

  closeCustomModal();
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><span>🛒</span><p>Your tray is empty.<br>Tap an item to add it!</p></div>`;
    document.getElementById('checkout-btn').disabled = true;
    updateCartTotals(0);
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${item.name} (x${item.quantity})</h4>
        ${item.selectedCustomizations.map(c => `<small>+ ${c.name}</small>`).join('')}
        <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
      </div>
      <button style="background:none;border:none;color:#ff4444;cursor:pointer;" onclick="removeFromCart(${index})">🗑️</button>
    </div>
  `).join('');

  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  updateCartTotals(subtotal);
  document.getElementById('checkout-btn').disabled = false;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function updateCartTotals(subtotal) {
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  document.getElementById('subtotal-val').innerText = `$${subtotal.toFixed(2)}`;
  document.getElementById('tax-val').innerText = `$${tax.toFixed(2)}`;
  document.getElementById('total-val').innerText = `$${total.toFixed(2)}`;
}

function openCheckout() {
  document.getElementById('payment-stage').style.display = 'block';
  document.getElementById('receipt-stage').style.display = 'none';
  document.getElementById('checkout-modal').classList.add('active');
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.remove('active');
}

async function processPayment(method) {
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const total = subtotal * 1.08;

  const payload = {
    items: cart,
    total_amount: parseFloat(total.toFixed(2)),
    order_type: selectedOrderType,
    payment_method: method
  };

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await res.json();
    const orderNum = result.data ? result.data.orderNumber : '#QB-' + Math.floor(100000 + Math.random() * 900000);

    document.getElementById('receipt-number').innerText = orderNum;
    document.getElementById('payment-stage').style.display = 'none';
    document.getElementById('receipt-stage').style.display = 'block';
  } catch (err) {
    alert('Failed to place order. Please try again.');
  }
}

function resetKiosk() {
  cart = [];
  renderCart();
  closeCheckoutModal();
}