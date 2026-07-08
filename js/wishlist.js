const WISHLIST_STORAGE_KEY = 'novacart.wishlist';

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveWishlist(items) {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const exists = wishlist.includes(productId);
  const next = exists ? wishlist.filter(id => id !== productId) : [...wishlist, productId];
  saveWishlist(next);
  renderWishlistCount();
  renderWishlist();
  showToast(exists ? 'Removed from wishlist' : 'Added to wishlist');
}

function isWishlisted(productId) {
  return getWishlist().includes(productId);
}

function renderWishlistCount() {
  const count = getWishlist().length;
  document.querySelectorAll('[data-wishlist-count]').forEach(el => {
    el.textContent = count;
  });
}

function renderWishlist() {
  const container = document.getElementById('wishlist-container');
  if (!container) return;
  const items = getWishlist().map(id => products.find(p => p.id === id)).filter(Boolean);
  if (!items.length) {
    container.innerHTML = '<div class="alert alert-light">No saved items yet.</div>';
    return;
  }
  container.innerHTML = items.map(item => `
    <div class="card border-0 shadow-sm p-3 mb-3">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h3 class="h6 mb-1">${item.name}</h3>
          <p class="text-muted mb-0">$${item.price}</p>
        </div>
        <button class="btn btn-outline-danger btn-sm" data-wishlist-remove="${item.id}">Remove</button>
      </div>
    </div>
  `).join('');
  container.querySelectorAll('[data-wishlist-remove]').forEach(btn => {
    btn.addEventListener('click', () => toggleWishlist(Number(btn.getAttribute('data-wishlist-remove'))));
  });
}
