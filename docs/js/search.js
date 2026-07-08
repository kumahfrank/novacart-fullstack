const productsPerPage = 8;

function getFilteredProducts() {
  const search = document.getElementById('shop-search')?.value?.toLowerCase() || '';
  const category = document.getElementById('category-filter')?.value || 'All';
  const price = Number(document.getElementById('price-filter')?.value || 500);
  const rating = Number(document.getElementById('rating-filter')?.value || 0);
  const sort = document.getElementById('sort-filter')?.value || 'featured';

  let filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search) || product.category.toLowerCase().includes(search);
    const matchesCategory = category === 'All' || product.category === category;
    const matchesPrice = product.price <= price;
    const matchesRating = product.rating >= rating;
    return matchesSearch && matchesCategory && matchesPrice && matchesRating;
  });

  switch (sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      filtered.sort((a, b) => Number(b.newest) - Number(a.newest));
      break;
    case 'bestselling':
      filtered.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
      break;
    default:
      filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  return filtered;
}

function renderShopProducts(page = 1) {
  const grid = document.getElementById('shop-grid');
  const pagination = document.getElementById('pagination');
  if (!grid) return;

  const filtered = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / productsPerPage));
  const start = (page - 1) * productsPerPage;
  const visible = filtered.slice(start, start + productsPerPage);

  grid.innerHTML = visible.map(product => `
    <div class="col-md-6 col-xl-4">
      <article class="product-card h-100 fade-in">
        <div class="position-relative">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <button class="btn btn-light btn-sm quick-view-btn" data-view-id="${product.id}" aria-label="Quick view ${product.name}"><i class="fa-solid fa-eye"></i></button>
          <span class="badge badge-sale position-absolute top-0 start-0 m-3">-${product.discount}%</span>
        </div>
        <div class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">${product.category}</span>
            <button class="btn btn-link p-0 wishlist-btn ${isWishlisted(product.id) ? 'active' : ''}" data-wishlist-id="${product.id}" aria-label="Add to wishlist"><i class="fa-solid fa-heart"></i></button>
          </div>
          <h3 class="h6 fw-bold mb-2"><a href="product.html?id=${product.id}" class="text-decoration-none text-reset">${product.name}</a></h3>
          <div class="rating-stars mb-2"><i class="fa-solid fa-star"></i> ${product.rating} <span class="text-muted">(${product.reviews})</span></div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div class="fw-bold">$${product.price}</div>
              <del class="text-muted">$${product.oldPrice}</del>
            </div>
            <span class="text-success">${product.stock}</span>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-grow-1" data-add-cart="${product.id}">Add to Cart</button>
            <a href="product.html?id=${product.id}" class="btn btn-outline-secondary"><i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </article>
    </div>
  `).join('');

  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i += 1) {
    const active = i === page ? 'active' : '';
    pagination.innerHTML += `<li class="page-item ${active}"><button class="page-link" data-page="${i}">${i}</button></li>`;
  }

  grid.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      addToCart(Number(btn.getAttribute('data-add-cart')));
    });
  });

  grid.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', () => toggleWishlist(Number(btn.getAttribute('data-wishlist-id'))));
  });

  grid.querySelectorAll('[data-view-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      showQuickView(Number(btn.getAttribute('data-view-id')));
    });
  });

  pagination.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => renderShopProducts(Number(btn.getAttribute('data-page'))));
  });
}

function renderHomeSections() {
  const featuredContainer = document.getElementById('featured-products');
  const bestSellerContainer = document.getElementById('best-sellers');
  const arrivalContainer = document.getElementById('new-arrivals');
  const categoryContainer = document.getElementById('category-grid');

  if (categoryContainer) {
    categoryContainer.innerHTML = categories.slice(0, 6).map(category => `
      <div class="col-md-4 col-lg-2">
        <div class="category-card p-4 text-center h-100">
          <h3 class="h6 fw-bold mb-0">${category}</h3>
        </div>
      </div>
    `).join('');
  }

  if (featuredContainer) {
    featuredContainer.innerHTML = products.filter(product => product.featured).slice(0, 4).map(product => createProductCard(product)).join('');
  }

  if (bestSellerContainer) {
    bestSellerContainer.innerHTML = products.filter(product => product.bestSeller).slice(0, 2).map(product => createProductCard(product)).join('');
  }

  if (arrivalContainer) {
    arrivalContainer.innerHTML = products.filter(product => product.newest).slice(0, 4).map(product => createProductCard(product)).join('');
  }
}

function createProductCard(product) {
  return `
    <div class="col-md-6 col-lg-6">
      <article class="product-card h-100 fade-in">
        <div class="position-relative">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <button class="btn btn-light btn-sm quick-view-btn" data-view-id="${product.id}" aria-label="Quick view ${product.name}"><i class="fa-solid fa-eye"></i></button>
          <span class="badge badge-sale position-absolute top-0 start-0 m-3">-${product.discount}%</span>
        </div>
        <div class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">${product.category}</span>
            <button class="btn btn-link p-0 wishlist-btn ${isWishlisted(product.id) ? 'active' : ''}" data-wishlist-id="${product.id}" aria-label="Add to wishlist"><i class="fa-solid fa-heart"></i></button>
          </div>
          <h3 class="h6 fw-bold mb-2"><a href="product.html?id=${product.id}" class="text-decoration-none text-reset">${product.name}</a></h3>
          <div class="rating-stars mb-2"><i class="fa-solid fa-star"></i> ${product.rating} <span class="text-muted">(${product.reviews})</span></div>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <div class="fw-bold">$${product.price}</div>
              <del class="text-muted">$${product.oldPrice}</del>
            </div>
            <span class="text-success">${product.stock}</span>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-grow-1" data-add-cart="${product.id}">Add to Cart</button>
            <a href="product.html?id=${product.id}" class="btn btn-outline-secondary"><i class="fa-solid fa-arrow-right"></i></a>
          </div>
        </div>
      </article>
    </div>
  `;
}

function renderProductDetail() {
  const detailContainer = document.getElementById('product-detail');
  const relatedContainer = document.getElementById('related-products');
  if (!detailContainer) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id'));
  const product = products.find(item => item.id === id) || products[0];

  document.title = `${product.name} | NovaCart`;
  detailContainer.innerHTML = `
    <div class="row g-4">
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm p-3">
          <img src="${product.image}" alt="${product.name}" class="rounded-4" />
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm p-4">
          <p class="text-uppercase text-primary fw-semibold mb-2">${product.category}</p>
          <h2 class="h3 fw-bold mb-3">${product.name}</h2>
          <p class="text-muted">${product.description}</p>
          <div class="rating-stars mb-3"><i class="fa-solid fa-star"></i> ${product.rating} <span class="text-muted">(${product.reviews} reviews)</span></div>
          <div class="d-flex align-items-center gap-3 mb-3">
            <span class="h3 fw-bold mb-0">$${product.price}</span>
            <del class="text-muted">$${product.oldPrice}</del>
            <span class="badge badge-sale">-${product.discount}%</span>
          </div>
          <p class="text-success fw-semibold">${product.stock}</p>
          <div class="d-flex gap-2 mb-3">
            <button class="btn btn-primary" data-add-cart="${product.id}">Add to Cart</button>
            <button class="btn btn-outline-secondary" data-wishlist-id="${product.id}">Wishlist</button>
            <button class="btn btn-outline-primary">Buy Now</button>
          </div>
          <div class="border-top pt-3">
            <h3 class="h6 fw-bold">Specifications</h3>
            <ul class="text-muted mb-0">
              <li>Premium materials</li>
              <li>Free shipping over $100</li>
              <li>30-day returns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  relatedContainer.innerHTML = products.filter(item => item.category === product.category && item.id !== product.id).slice(0, 4).map(item => createProductCard(item)).join('');

  detailContainer.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(Number(btn.getAttribute('data-add-cart'))));
  });
  detailContainer.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    btn.addEventListener('click', () => toggleWishlist(Number(btn.getAttribute('data-wishlist-id'))));
  });
}

function populateCategoryFilter() {
  const select = document.getElementById('category-filter');
  if (!select) return;
  select.innerHTML = '<option value="All">All</option>' + categories.map(category => `<option value="${category}">${category}</option>`).join('');
}

function attachShopListeners() {
  const searchInput = document.getElementById('shop-search');
  const categorySelect = document.getElementById('category-filter');
  const priceInput = document.getElementById('price-filter');
  const ratingSelect = document.getElementById('rating-filter');
  const sortSelect = document.getElementById('sort-filter');
  const priceValue = document.getElementById('price-value');

  if (priceInput && priceValue) {
    priceInput.addEventListener('input', () => {
      priceValue.textContent = `$${priceInput.value}`;
      renderShopProducts();
    });
  }

  [searchInput, categorySelect, ratingSelect, sortSelect].forEach(element => {
    if (element) {
      element.addEventListener('input', () => renderShopProducts());
      element.addEventListener('change', () => renderShopProducts());
    }
  });
}

function showQuickView(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  const modal = document.createElement('div');
  modal.className = 'modal fade show d-block';
  modal.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body p-4">
          <button class="btn-close float-end" data-close-modal="true"></button>
          <img src="${product.image}" alt="${product.name}" class="rounded-4 mb-3" />
          <h3 class="h5 fw-bold">${product.name}</h3>
          <p class="text-muted">${product.description}</p>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold">$${product.price}</span>
            <button class="btn btn-primary" data-add-cart="${product.id}">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('[data-close-modal]').addEventListener('click', () => modal.remove());
  modal.querySelector('[data-add-cart]').addEventListener('click', () => {
    addToCart(product.id);
    modal.remove();
  });
}
