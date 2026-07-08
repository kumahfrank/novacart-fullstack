const CART_STORAGE_KEY = 'novacart.cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }
  saveCart(cart);
  renderCartCount();
  showToast('Added to cart');
}

function updateCartItem(productId, quantity) {
  const cart = getCart();
  const next = cart.filter(item => item.id !== productId);
  if (quantity > 0) {
    next.push({ id: productId, quantity });
  }
  saveCart(next);
  renderCartCount();
  renderCart();
}

function removeFromCart(productId) {
  const next = getCart().filter(item => item.id !== productId);
  saveCart(next);
  renderCartCount();
  renderCart();
  showToast('Item removed');
}

function getCartItems() {
  const cart = getCart();
  return cart.map(item => ({ ...item, product: products.find(p => p.id === item.id) })).filter(item => item.product);
}

function getCartSubtotal() {
  return getCartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

function getCartTax() {
  return getCartSubtotal() * 0.08;
}

function getCartShipping() {
  return getCartSubtotal() > 0 ? 15 : 0;
}

function getCartTotal() {
  return getCartSubtotal() + getCartTax() + getCartShipping();
}

function renderCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach(el => {
    el.textContent = count;
  });
}

function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return;

  const cartItems = getCartItems();
  if (!cartItems.length) {
    container.innerHTML = `
      <div class="card border-0 shadow-sm p-5 text-center">
        <h2 class="h4 fw-bold mb-3">Your cart is empty</h2>
        <p class="text-muted">Add a few favorites and come back here anytime.</p>
        <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm p-4">
          <h2 class="h4 fw-bold mb-4">Shopping Cart</h2>
          ${cartItems.map(item => `
            <div class="d-flex align-items-center justify-content-between border-bottom py-3">
              <div class="d-flex align-items-center gap-3">
                <img src="${item.product.image}" alt="${item.product.name}" class="rounded-3" style="width:72px;height:72px;object-fit:cover" />
                <div>
                  <h3 class="h6 mb-1">${item.product.name}</h3>
                  <p class="text-muted mb-0">$${item.product.price}</p>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" data-action="decrease" data-id="${item.id}">-</button>
                <span class="px-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary" data-action="increase" data-id="${item.id}">+</button>
              </div>
              <div class="fw-semibold">$${item.product.price * item.quantity}</div>
              <button class="btn btn-link text-danger" data-action="remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4">
          <h3 class="h5 fw-bold mb-3">Order Summary</h3>
          <div class="d-flex justify-content-between mb-2"><span>Subtotal</span><span>$${getCartSubtotal().toFixed(2)}</span></div>
          <div class="d-flex justify-content-between mb-2"><span>Tax</span><span>$${getCartTax().toFixed(2)}</span></div>
          <div class="d-flex justify-content-between mb-2"><span>Shipping</span><span>$${getCartShipping().toFixed(2)}</span></div>
          <hr />
          <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>$${getCartTotal().toFixed(2)}</span></div>
          <div class="mt-3">
            <label class="form-label" for="coupon-code">Coupon code</label>
            <input id="coupon-code" class="form-control" placeholder="Enter promo" />
          </div>
          <a href="checkout.html" class="btn btn-primary w-100 mt-3">Proceed to Checkout</a>
          <a href="shop.html" class="btn btn-outline-secondary w-100 mt-2">Continue Shopping</a>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const action = btn.getAttribute('data-action');
      const current = getCart().find(item => item.id === id);
      if (!current) return;
      if (action === 'increase') updateCartItem(id, current.quantity + 1);
      if (action === 'decrease') updateCartItem(id, current.quantity - 1);
      if (action === 'remove') removeFromCart(id);
    });
  });
}
