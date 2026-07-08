function renderCheckout() {
  const container = document.getElementById('checkout-container');
  if (!container) return;

  const items = getCartItems();
  if (!items.length) {
    container.innerHTML = '<div class="alert alert-info">Your cart is empty. Add items before checkout.</div>';
    return;
  }

  container.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card border-0 shadow-sm p-4">
          <h2 class="h4 fw-bold mb-3">Checkout</h2>
          <form id="checkout-form" novalidate>
            <div class="row g-3">
              <div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" required /></div>
              <div class="col-md-6"><label class="form-label">Email</label><input type="email" class="form-control" required /></div>
              <div class="col-md-6"><label class="form-label">Phone</label><input class="form-control" required /></div>
              <div class="col-md-6"><label class="form-label">Address</label><input class="form-control" required /></div>
              <div class="col-md-6"><label class="form-label">City</label><input class="form-control" required /></div>
              <div class="col-md-6"><label class="form-label">State</label><input class="form-control" required /></div>
              <div class="col-12">
                <label class="form-label">Payment Method</label>
                <div class="d-flex flex-wrap gap-2">
                  <div class="form-check"><input class="form-check-input" type="radio" name="payment" checked /><label class="form-check-label">Credit/Debit Card</label></div>
                  <div class="form-check"><input class="form-check-input" type="radio" name="payment" /><label class="form-check-label">Mobile Money</label></div>
                  <div class="form-check"><input class="form-check-input" type="radio" name="payment" /><label class="form-check-label">PayPal</label></div>
                  <div class="form-check"><input class="form-check-input" type="radio" name="payment" /><label class="form-check-label">Cash on Delivery</label></div>
                </div>
              </div>
            </div>
            <button class="btn btn-primary mt-4" type="submit">Place Order</button>
          </form>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm p-4">
          <h3 class="h5 fw-bold mb-3">Order Summary</h3>
          ${items.map(item => `<div class="d-flex justify-content-between mb-2"><span>${item.product.name} × ${item.quantity}</span><span>$${item.product.price * item.quantity}</span></div>`).join('')}
          <hr />
          <div class="d-flex justify-content-between"><span>Shipping</span><span>$${getCartShipping().toFixed(2)}</span></div>
          <div class="d-flex justify-content-between"><span>Tax</span><span>$${getCartTax().toFixed(2)}</span></div>
          <div class="d-flex justify-content-between fw-bold mt-2"><span>Total</span><span>$${getCartTotal().toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const inputs = form.querySelectorAll('input');
      const valid = Array.from(inputs).every(input => input.value.trim() || input.type === 'radio');
      if (!valid) {
        showToast('Please complete the checkout form.');
        return;
      }
      showToast('Order placed successfully!');
      localStorage.removeItem(CART_STORAGE_KEY);
      renderCartCount();
      renderCheckout();
    });
  }
}
